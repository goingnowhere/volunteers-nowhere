import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { _ } from 'meteor/underscore'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import {
  displayName,
  rawCollectionOp,
  VolunteersClass,
  wrapAsync,
} from 'meteor/goingnowhere:volunteers'
import { MeteorProfile, Volunteers } from '../both/init'
import {
  isNoInfoMixin,
} from '../both/authMixins'
import {
  dietGroups,
  allergies,
  intolerances,
  volunteerFormSchema,
} from '../both/collections/users'
import { EventSettings, SettingsSchema } from '../both/collections/settings'
import { lookupUserTicket, serverCheckHash } from './fistbump'

const moment = extendMoment(Moment)
const authMixins = Volunteers.services.auth.mixins

Meteor.methods({
  sendVerificationEmail() {
    Accounts.sendVerificationEmail(this.userId)
  },
})

export const getEventSettings = new ValidatedMethod({
  name: 'eventSettings',
  validate: null,
  run: () => EventSettings.findOne(),
})

const EnrollUserSchema = new SimpleSchema({
  email: String,
  profile: Object,
  'profile.firstName': String,
  'profile.lastName': String,
  'profile.ticketNumber': String,
})

export const enrollUser = ({
  name: 'Accounts.enrollUserCustom',
  validate: EnrollUserSchema.validator(),
  mixins: [authMixins.isManager],
  run() {
  // run(user) {
    throw new Meteor.Error(501)
    // const userId = Accounts.createUser(user)
    // Accounts.sendEnrollmentEmail(userId)
  },
})

const ChangePasswordSchema = new SimpleSchema({
  userId: String,
  password: String,
  password_again: String,
})

export const adminChangeUserPassword = new ValidatedMethod({
  name: 'Accounts.adminChangeUserPassword',
  mixins: [authMixins.isSameUserOrManager],
  validate: ChangePasswordSchema.validator(),
  run(doc) {
    if (doc.password === doc.password_again) {
      Accounts.setPassword(doc.userId, doc.password)
    } else {
      throw new Meteor.Error('userError', "Passwords don't match")
    }
  },
})

export const userStats = new ValidatedMethod({
  name: 'users.stats',
  mixins: [isNoInfoMixin],
  validate: null,
  run() {
    const settings = EventSettings.findOne()
    const eventStart = settings.eventPeriod.start
    const eventEnd = moment(settings.eventPeriod.end).add(1, 'day').toDate().toISOString()
    const [stats] = Meteor.users.aggregate([
      {
        $match: { isBanned: false },
      }, {
        $lookup: {
          from: Volunteers.collections.signups._name,
          as: 'signups',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] }, status: 'confirmed' } },
            {
              $lookup: {
                from: Volunteers.collections.shift._name,
                as: 'shift',
                let: { shiftId: '$shiftId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shiftId'] } } }],
              },
            }, {
              $unwind: { path: '$shift', preserveNullAndEmptyArrays: true },
            }, {
              $addFields: {
                start: {
                  $cond: { if: { $eq: ['$type', 'shift'] }, then: '$shift.start', else: '$start' },
                },
                end: {
                  $cond: { if: { $eq: ['$type', 'shift'] }, then: '$shift.end', else: '$end' },
                },
              },
            }, {
              $group: {
                _id: null,
                count: { $sum: 1 },
                leads: { $sum: { $cond: { if: { $eq: ['$type', 'lead'] }, then: 1, else: 0 } } },
                eventTime: {
                  $sum: {
                    $cond: {
                      if: {
                        $and: [{ $gt: ['$start', eventStart] }, { $lt: ['$end', { $toDate: eventEnd }] }],
                      },
                      then: 1,
                      else: 0,
                    },
                  },
                },
              },
            },
          ],
        },
      }, {
        $unwind: { path: '$signups', preserveNullAndEmptyArrays: true },
      }, {
        $group: {
          _id: null,
          registered: { $sum: 1 },
          bioFilled: { $sum: { $cond: { if: '$profile.formFilled', then: 1, else: 0 } } },
          online: { $sum: { $cond: { if: '$status.online', then: 1, else: 0 } } },
          withTicket: {
            $sum: { $cond: { if: { $ne: [{ $type: '$ticketId' }, 'missing'] }, then: 1, else: 0 } },
          },
          withPicture: {
            $sum: {
              $cond: { if: { $ne: [{ $type: '$profile.picture' }, 'missing'] }, then: 1, else: 0 },
            },
          },
          withDuties: { $sum: { $cond: { if: { $gt: ['$signups.count', 0] }, then: 1, else: 0 } } },
          leads: { $sum: { $cond: { if: { $gt: ['$signups.leads', 0] }, then: 1, else: 0 } } },
          eventTimeAny: {
            $sum: { $cond: { if: { $gt: ['$signups.eventTime', 0] }, then: 1, else: 0 } },
          },
          eventTimeThree: {
            $sum: { $cond: { if: { $gt: ['$signups.eventTime', 2] }, then: 1, else: 0 } },
          },
        },
      },
    ])
    return stats
  },
})

const onlyFilled = { 'profile.formFilled': true }
const userSearch = ({
  search,
  page,
  perPage = 20,
  isManager,
  includeIncomplete,
}) => {
  const query = !includeIncomplete ? { ...onlyFilled, ...search } : search
  // TODO We shouldn't need much here, now that the methods are separated we should remove
  // what we don't need for non-managers
  const fields = {
    profile: true,
    isBanned: true,
    status: true,
    createdAt: true,
    ticketId: true,
    ...isManager ? {
      emails: true,
      roles: true,
    } : {},
  }
  const usersCursor = Meteor.users.find(query, {
    sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
    skip: !page ? 0 : (page - 1) * perPage,
    limit: perPage,
    fields,
  })
  // Page is undefined for the first page, so we get a new count, otherwise save the extra query
  const getCount = wrapAsync(async () => {
    return page === undefined ? Meteor.users.countDocuments(query) : undefined
  })
  return {
    count: getCount(),
    users: usersCursor.fetch(),
    extras: !isManager ? undefined
      : Object.fromEntries(usersCursor.map(user => {
        const allRoles = Roles.getRolesForUser(user._id, { scope: Volunteers.eventName })
        const roles = [
          ...allRoles.filter(role => ['manager', 'admin'].includes(role)),
          ...allRoles.some(role => !['manager', 'admin'].includes(role)) ? ['lead'] : [],
        ]
        return [
          user._id,
          { roles },
        ]
      })),
  }
}

export const userList = new ValidatedMethod({
  name: 'users.paged',
  mixins: [authMixins.isAnyLead],
  validate: () => {},
  run({
    search,
    page,
    perPage,
    includeIncomplete,
  }) {
    return userSearch({
      search,
      page,
      perPage,
      includeIncomplete,
    })
  },
})

export const userListManager = new ValidatedMethod({
  name: 'users.paged.manager',
  mixins: [authMixins.isManager],
  validate: () => {},
  run({
    search,
    page,
    perPage,
    includeIncomplete,
  }) {
    return userSearch({
      search,
      page,
      perPage,
      isManager: true,
      includeIncomplete,
    })
  },
})

const userBioSchema = new SimpleSchema({
  userId: { type: String },
  ticketId: { type: Number, optional: true },
})
userBioSchema.extend(MeteorProfile.Schemas.Profile)
userBioSchema.extend(volunteerFormSchema)

export const updateUserBio = new ValidatedMethod({
  name: 'volunteerBio.update',
  mixins: [authMixins.isSameUserOrManager],
  validate: userBioSchema.validator(),
  run({
    userId,
    ticketId,
    firstName,
    lastName,
    nickname,
    picture,
    language,
    ...nonProfileData
  }) {
    const currentUser = Meteor.user()
    let ticketInfo = {}
    // 0 is no ticket, -1 is error
    let ticket = 0
    let hasTicket = !!ticketId
    console.log({ticketId, hasTicket})
    if (ticketId && ticketId !== currentUser.ticketId) {
      ticket = lookupUserTicket({ ticketId })
      if (ticket && ticket !== -1) {
        ticketInfo = {
          ticketId: ticket.TicketId,
          rawTicketInfo: ticket,
        }
      } else {
        hasTicket = false
      }
    }

    Meteor.users.update({ _id: userId }, {
      $set: {
        profile: {
          firstName,
          lastName,
          nickname,
          language,
          picture,
          formFilled: true,
        },
        ...ticketInfo,
      },
      // Only unset ticket if there was no error and no ticket
      ...((ticket === 0 && !hasTicket) && {
        $unset: {
          ticketId: true,
          rawTicketInfo: true,
        },
      }),
    })
    Volunteers.collections.volunteerForm.upsert({ userId }, { $set: nonProfileData })

    return {
      hasTicket,
      wasError: ticket === -1,
    }
  },
})

const mapCsvExport = ({
  shift,
  project,
  user,
  ...signup
}) => {
  let title, start, end
  if (shift) {
    ({ title } = shift)
    start = moment(shift.start).format('DD/MM/YYYY HH:mm')
    end = moment(shift.end).format('DD/MM/YYYY HH:mm')
  } else {
    ({ title } = project)
    start = moment(signup.start).format('DD/MM/YYYY')
    end = moment(signup.end).format('DD/MM/YYYY')
  }
  return {
    shift: title,
    start,
    end,
    name: user.profile.nickname || user.profile.firstName,
    email: user.emails[0].address,
    ticket: user.ticketId || '',
    fullName: `${user.profile.firstName} ${user.profile.lastName || ''}`,
  }
}

const getTeamRotaCsv = ({ parentId }) => Volunteers.collections.signups.aggregate([
  {
    $match: {
      parentId,
      status: 'confirmed',
      type: {
        $in: [
          'shift',
          'project',
          // 'task',
        ],
      },
    },
  },
  {
    $lookup: {
      from: Meteor.users._name,
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    },
  },
  { $unwind: { path: '$user' } },
  {
    $lookup: {
      from: Volunteers.collections.dutiesCollections.shift._name,
      localField: 'shiftId',
      foreignField: '_id',
      as: 'shift',
    },
  },
  {
    $unwind: {
      path: '$shift',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: Volunteers.collections.dutiesCollections.project._name,
      localField: 'shiftId',
      foreignField: '_id',
      as: 'project',
    },
  },
  {
    $unwind: {
      path: '$project',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $match: { $or: [{ project: { $exists: true } }, { shift: { $exists: true } }] },
  },
]).map(mapCsvExport)

export const teamRotaData = new ValidatedMethod({
  name: 'team.rota',
  mixins: [authMixins.isLead],
  validate: null,
  run: getTeamRotaCsv,
})

export const deptRotaData = new ValidatedMethod({
  name: 'dept.rota',
  mixins: [authMixins.isLead],
  validate: null,
  run({ parentId }) {
    return _.flatten(
      Volunteers.collections.team.find({ parentId })
        .map((team) => getTeamRotaCsv({ parentId: team._id })
          .map((rotaItem) => ({ ...rotaItem, team: team.name }))),
      true,
    )
  },
})

export const allRotaData = new ValidatedMethod({
  name: 'all.rota',
  mixins: [authMixins.isManager],
  validate: null,
  run() {
    return _.flatten(
      Volunteers.collections.team.find({})
        .map((team) => getTeamRotaCsv({ parentId: team._id })
          .map((rotaItem) => ({ team: team.name, ...rotaItem }))),
      true,
    )
  },
})

function mapEECsvExport({
  user,
  type,
  shift,
  project,
  team,
  ...signup
}) {
  const { start, end } = type === 'shift' ? shift : signup
  const { title } = type === 'shift' ? shift : project
  return {
    eeDate: moment(start).subtract(1, 'days').format('DD/MM/YY'),
    start: moment(start).format(),
    end: moment(end).format(),
    team: team.name,
    title,
    name: displayName(user),
    email: user.emails[0].address,
    ticket: user.ticketId || '',
    fullName: `${user.profile.firstName} ${user.profile.lastName || ''}`,
  }
}

export const eeCsvData = new ValidatedMethod({
  name: 'ee.csv',
  mixins: [authMixins.isLead],
  validate: null,
  run({ parentId }) {
    const eventSettings = EventSettings.findOne()
    const { end: buildEnd } = eventSettings.buildPeriod
    // Extra days, one to adjust for shifts on first day giving EE the day before, the other to push
    // it to include people on the first day of the event
    const buildEndMoment = moment(buildEnd).add(2, 'day')
    const match = {
      status: 'confirmed',
      type: {
        $in: [
          'shift',
          'project',
        ],
      },
    }
    // TODO actually filter projects and shifts for start date before the end
    // const startMatch = {
    //   $gte: moment(start).startOf('day').toDate(),
    //   $lte: moment(end).endOf('day').toDate(),
    // }
    if (parentId) {
      const dept = Volunteers.collections.department.findOne({ _id: parentId })
      if (dept) {
        const teams = Volunteers.collections.team.find({ parentId: dept._id }).fetch()
        match.parentId = { $in: teams.map(team => team._id) }
      } else {
        match.parentId = parentId
      }
    }

    const signups = Volunteers.collections.signups.aggregate([
      { $match: match },
      {
        $lookup: {
          from: Meteor.users._name,
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user' } },
      {
        $lookup: {
          from: Volunteers.collections.team._name,
          localField: 'parentId',
          foreignField: '_id',
          as: 'team',
        },
      },
      { $unwind: { path: '$team' } },
      {
        $lookup: {
          from: Volunteers.collections.shift._name,
          localField: 'shiftId',
          foreignField: '_id',
          as: 'shift',
        },
      },
      {
        $unwind: {
          path: '$shift',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: Volunteers.collections.project._name,
          localField: 'shiftId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // Either it's a shift or it's a project
        $match: { $or: [{ shift: { $exists: true } }, { project: { $exists: true } }] },
      },
    ]).map(mapEECsvExport)
      .filter(signup => buildEndMoment.isAfter(signup.start))

    signups.sort((a, b) => (moment(a.start).isBefore(b.start) ? -1 : 1))
    const byUserSorted = new Map()
    signups.forEach((signup) => {
      let allForUser = byUserSorted.get(signup.email)
      if (!allForUser) {
        allForUser = []
        byUserSorted.set(signup.email, allForUser)
      }
      allForUser.push(signup)
    })

    return [...byUserSorted.entries()].map(([, allForUser]) => {
      return {
        ...allForUser[0],
        end: allForUser[allForUser.length - 1].end,
        teamProgression: allForUser.map(({ team, title }) => `${team}: ${title}`).join(' -> '),
        dates: allForUser.map(({ start, end }) => `${start} - ${end}`).join(' // '),
      }
    })
  },
})

/**
 * Take a new event name and event dates and migrate everything over from the
 * previous event.
 * Currently using anything but the current `eventName` might not work as we need to
 * avoid singletons including this eventName in the main (not submodule) project
 */
export const newEventMigration = new ValidatedMethod({
  name: 'event.new.event',
  mixins: [authMixins.isManager],
  validate: SettingsSchema.validator({ keys: ['eventName', 'eventPeriod'] }),
  run(newSettings) {
    const oldSettings = EventSettings.findOne()
    if (!oldSettings.eventName) {
      throw new Meteor.Error(500, "We don't have an event name so can't proceed :(")
    }
    if (oldSettings.eventName === newSettings.eventName) {
      throw new Meteor.Error(400, 'Not ready to move on. We still need to process last year')
    }
    const sourceEvent = new VolunteersClass({
      ...oldSettings,
      SettingsCollection: EventSettings,
    }, true)
    const volForms = sourceEvent.collections.volunteerForm.find().fetch()
    const departments = sourceEvent.collections.department.find().fetch()
    const teams = sourceEvent.collections.team.find().fetch()
    const rotas = sourceEvent.collections.rotas.find().fetch()
    const shifts = sourceEvent.collections.shift.find().fetch()
    const projects = sourceEvent.collections.project.find().fetch()
    const leads = sourceEvent.collections.lead.find().fetch()
    const leadSignups = sourceEvent.collections.signups.find({
      type: 'lead',
      status: 'confirmed',
    }).fetch()

    rawCollectionOp(Volunteers.collections.volunteerForm, 'insertMany', volForms)

    // Maintain managers and admins from last event
    // Not used as we need to update the hard-coded event name first, then we need a manager to be
    // able to press the magic button
    // Meteor.users.update(
    //   {
    //     roles: { $elemMatch: { _id: 'admin', scope: oldSettings.eventName } },
    //   },
    //   { $addToSet: { roles: { _id: 'admin', scope: newSettings.eventName, assigned: true } } },
    //   { multi: true },
    // )
    // Meteor.users.update(
    //   {
    //     roles: { $elemMatch: { _id: 'manager', scope: oldSettings.eventName } },
    //   },
    //   { $addToSet: { roles: { _id: 'manager', scope: newSettings.eventName, assigned: true } } },
    //   { multi: true },
    // )

    const eventStartDiff = moment(newSettings.eventPeriod.start)
      .diff(oldSettings.eventPeriod.start, 'days')

    const shiftDate = (date) =>
      moment(date).add(eventStartDiff, 'days').toDate()

    // We don't really use divisions, so just find the current one or create it
    const division = Volunteers.collections.division.findOne()
    let divId
    if (division) {
      divId = division._id
    } else {
      divId = Volunteers.collections.division.insert({
        name: 'NOrg',
        policy: 'public',
        parentId: 'TopEntity',
      })
    }

    const deptIds = {}
    Volunteers.collections.department.remove({})
    departments.forEach(({ _id: oldId, ...dept }) => {
      const deptId = Volunteers.collections.department.insert({
        ...dept,
        parentId: divId,
      })
      Roles.createRole(deptId)
      Roles.addRolesToParent(deptId, divId)
      deptIds[oldId] = deptId
    })

    const teamIds = {}
    Volunteers.collections.team.remove({})
    teams.forEach(({ _id: oldId, parentId: oldParent, ...rest }) => {
      const parentId = deptIds[oldParent]
      if (!parentId) {
        console.error('Error finding department for team', rest.title)
        console.error(new Error(`Department does not exist: ${oldParent}`))
        return
      }
      const teamId = Volunteers.collections.team.insert({
        ...rest,
        parentId,
      })
      Roles.createRole(teamId)
      Roles.addRolesToParent(teamId, parentId)
      teamIds[oldId] = teamId
    })

    // const nonUniqueRotaNames = {}
    const rotaIds = {}
    Volunteers.collections.rotas.remove({})
    rotas.forEach(({
      _id: oldId,
      parentId: oldParent,
      start,
      end,
      ...rest
    }) => {
      const parentId = teamIds[oldParent]
      if (!parentId) {
        console.error('Error finding team for rota', rest.title)
        console.error(new Error(`Team does not exist: ${oldParent}`))
        return
      }
      const rotaId = Volunteers.collections.rotas.insert({
        ...rest,
        parentId,
        start: shiftDate(start),
        end: shiftDate(end),
      })
      rotaIds[oldId] = rotaId
    })

    Volunteers.collections.shift.remove({})
    shifts.forEach(({
      _id,
      rotaId: oldRota,
      parentId: oldParent,
      start,
      end,
      ...rest
    }) => {
      const rotaId = rotaIds[oldRota]
      const parentId = teamIds[oldParent]
      if (!parentId) {
        console.error('Error finding team for shift', rest.title)
        console.error(new Error(`Team does not exist: ${oldParent}`))
        return
      }
      if (!rotaId) {
        console.error('Error finding rota for shift', rest.title)
        console.error(new Error(`Rota does not exist: ${oldRota}`))
        return
      }
      Volunteers.collections.shift.insert({
        ...rest,
        rotaId,
        parentId,
        start: shiftDate(start),
        end: shiftDate(end),
      })
    })

    Volunteers.collections.project.remove({})
    projects.forEach(({
      _id,
      parentId: oldParent,
      start,
      end,
      ...rest
    }) => {
      const parentId = teamIds[oldParent]
      if (!parentId) {
        console.error('Error finding team for project', rest.title)
        console.error(new Error(`Team does not exist: ${oldParent}`))
        return
      }
      Volunteers.collections.project.insert({
        ...rest,
        parentId,
        start: shiftDate(start),
        end: shiftDate(end),
      })
    })

    Volunteers.collections.lead.remove({})
    const leadIds = {}
    leads.forEach(({
      _id: oldId,
      parentId: oldParent,
      ...rest
    }) => {
      const parentId = teamIds[oldParent] || deptIds[oldParent]
      if (!parentId) {
        console.error('Error finding team for lead', rest.title)
        console.error(new Error(`Team does not exist: ${oldParent}`))
        return
      }
      const leadId = Volunteers.collections.lead.insert({
        ...rest,
        parentId,
      })
      leadIds[oldId] = leadId
    })

    Volunteers.collections.signups.remove({})
    leadSignups.forEach(({
      _id: __,
      parentId: oldParent,
      shiftId: oldShift,
      ...rest
    }) => {
      const parentId = teamIds[oldParent] || deptIds[oldParent]
      if (!parentId) {
        console.error('Error finding team for signup', rest.shiftId)
        console.error(new Error(`Team does not exist: ${oldParent}`))
        return
      }
      const shiftId = leadIds[oldShift]
      if (!shiftId) {
        console.error('Error finding team for signup', rest.parentId)
        console.error(new Error(`Team does not exist: ${oldShift}`))
        return
      }
      Volunteers.collections.signups.insert({
        ...rest,
        parentId,
        shiftId,
      })
      Roles.addUsersToRoles(rest.userId, parentId, newSettings.eventName)
    })

    EventSettings.update({}, {
      $set: {
        eventPeriod: newSettings.eventPeriod,
        eventName: newSettings.eventName,
        previousEventName: oldSettings.eventName,
        buildPeriod: {
          start: shiftDate(oldSettings.buildPeriod.start),
          end: shiftDate(oldSettings.buildPeriod.end),
        },
        strikePeriod: {
          start: shiftDate(oldSettings.strikePeriod.start),
          end: shiftDate(oldSettings.strikePeriod.end),
        },
        barriosArrivalDate: shiftDate(oldSettings.barriosArrivalDate),
        fistOpenDate: shiftDate(oldSettings.fistOpenDate),
      },
    })

    // TODO Offer choice of whether to do this
    Meteor.users.update({},
      { $unset: { ticketId: '', rawTicketInfo: {} } }, { multi: true })
  },
})

/**
 * Export team structure, rotas and settings as JSON so they can be updated for the next
 * year and re-imported.
 */
export const allRotaExport = new ValidatedMethod({
  name: 'rota.all.export',
  mixins: [authMixins.isManager],
  validate: null,
  run({ eventName }) {
    const sourceEvent = new VolunteersClass(eventName, true)
    // This is weird as this one isn't part of the 'volunteers' class, so we can't
    // migrate it easily. Either some of the settings should be pulled in or there
    // should be a better migration strategy
    const settings = EventSettings.findOne()
    const department = sourceEvent.collections.department.find().fetch()
    const team = sourceEvent.collections.team.find().fetch()
    const rotas = sourceEvent.collections.rotas.find().fetch()
    const shift = sourceEvent.collections.shift.find().fetch()
    const project = sourceEvent.collections.project.find().fetch()
    const lead = sourceEvent.collections.lead.find().fetch()

    const deptNames = department.map(({ name }) => name)
    if (new Set(deptNames).size !== deptNames.length) {
      throw new Error('Non-unique department names exist')
    }
    const teamNames = team.map(({ name }) => name)
    if (new Set(teamNames).size !== teamNames.length) {
      throw new Error('Non-unique team names exist')
    }
    const rotaNames = []
    const nonUniqueRotaNames = []
    // eslint-disable-next-line no-restricted-syntax
    for (const rota of rotas) {
      if (rotaNames.includes(rota.title) && !nonUniqueRotaNames.includes(rota.title)) {
        nonUniqueRotaNames.push(rota.title)
      }
      rotaNames.push(rota.title)
    }
    const findRotaName = id => {
      const name = rotas.find(({ _id }) => _id === id)?.title
      if (nonUniqueRotaNames.includes(name)) {
        return `${name}-${id}`
      }
      return name
    }

    return {
      settings,
      departments: department.map(({ _id, parentId, ...rest }) => rest),
      teams: team.map(({ _id: __, parentId, ...rest }) => ({
        ...rest,
        department: department.find(({ _id }) => _id === parentId).name,
      })),
      rotas: rotas.map(({
        _id: rotaId,
        parentId,
        title,
        ...rest
      }) => ({
        ...rest,
        ...nonUniqueRotaNames.includes(title) ? { _id: rotaId } : {},
        title,
        team: team.find(({ _id }) => _id === parentId)?.name || parentId,
      })),
      shifts: shift.map(({
        _id: __,
        rotaId,
        parentId,
        ...rest
      }) => ({
        ...rest,
        rota: findRotaName(rotaId),
        team: team.find(({ _id }) => _id === parentId)?.name || parentId,
      })),
      projects: project.map(({ _id: __, parentId, ...rest }) => ({
        ...rest,
        team: team.find(({ _id }) => _id === parentId)?.name || parentId,
      })),
      leads: lead.map(({ _id: __, parentId, ...rest }) => ({
        ...rest,
        team: team.find(({ _id }) => _id === parentId)?.name || '',
        department: department.find(({ _id }) => _id === parentId)?.name || '',
      })),
    }
  },
})

export const allRotaImport = new ValidatedMethod({
  name: 'rota.all.import',
  mixins: [authMixins.isManager],
  validate: ({ rotaJson }) => {
    try {
      JSON.parse(rotaJson)
    } catch (err) {
      console.warn('Error while parsing rota json', err)
      throw new Match.Error('JSON is not valid')
    }
  },
  run({ rotaJson }) {
    const wholeRota = JSON.parse(rotaJson)
    // TODO Add backup of old tables
    const {
      departments,
      teams,
      leads,
      rotas,
      shifts,
      projects,
      settings,
    } = wholeRota
    const oldSettings = EventSettings.findOne()
    const eventStartDiff = moment(settings.eventPeriod.start)
      .diff(oldSettings.eventPeriod.start, 'days')

    const divId = Volunteers.collections.division.findOne()._id

    const deptIds = {}
    Volunteers.collections.department.remove({})
    departments.forEach(dept => {
      const deptId = Volunteers.collections.department.insert({
        ...dept,
        parentId: divId,
      })
      Roles.createRole(deptId)
      Roles.addRolesToParent(deptId, divId)
      deptIds[dept.name] = deptId
    })

    const teamIds = {}
    Volunteers.collections.team.remove({})
    teams.forEach(({ department, ...rest }) => {
      const parentId = deptIds[department]
      if (!parentId) {
        throw new Error(`Department does not exist: ${department}`)
      }
      const teamId = Volunteers.collections.team.insert({
        ...rest,
        parentId,
      })
      Roles.createRole(teamId)
      Roles.addRolesToParent(teamId, parentId)
      teamIds[rest.name] = teamId
    })

    const nonUniqueRotaNames = {}
    const rotaIds = {}
    Volunteers.collections.rotas.remove({})
    rotas.forEach(({
      _id,
      team,
      start,
      end,
      ...rest
    }) => {
      const parentId = teamIds[team]
      if (!parentId) {
        throw new Error(`Team does not exist: ${team}`)
      }
      const rotaId = Volunteers.collections.rotas.insert({
        ...rest,
        parentId,
        start: moment(start).add(eventStartDiff, 'days').toDate(),
        end: moment(end).add(eventStartDiff, 'days').toDate(),
      })
      rotaIds[rest.title] = rotaId
      if (_id) {
        // _id only exists if there are non-unique rota names. We need to keep it for lookups.
        nonUniqueRotaNames[`${rest.title}-${_id}`] = rotaId
      }
    })

    Volunteers.collections.shift.remove({})
    shifts.forEach(({
      _id,
      rota,
      team,
      start,
      end,
      ...rest
    }) => {
      let rotaId = rotaIds[rota]
      const parentId = teamIds[team]
      if (!parentId) {
        throw new Error(`Team does not exist: ${team}`)
      }
      if (!rotaId) {
        rotaId = nonUniqueRotaNames[rota]
        if (!rotaId) {
          throw new Error(`Rota does not exist: ${rota}`)
        }
      }
      Volunteers.collections.shift.insert({
        ...rest,
        rotaId,
        parentId,
        start: moment(start).add(eventStartDiff, 'days').toDate(),
        end: moment(end).add(eventStartDiff, 'days').toDate(),
      })
    })

    Volunteers.collections.project.remove({})
    projects.forEach(({
      _id,
      team,
      start,
      end,
      ...rest
    }) => {
      const parentId = teamIds[team]
      if (!parentId) {
        throw new Error(`Team does not exist: ${team}`)
      }
      Volunteers.collections.project.insert({
        ...rest,
        parentId,
        start: moment(start).add(eventStartDiff, 'days').toDate(),
        end: moment(end).add(eventStartDiff, 'days').toDate(),
      })
    })

    Volunteers.collections.lead.remove({})
    leads.forEach(({
      _id,
      team,
      department,
      ...rest
    }) => {
      const parentId = teamIds[team] || deptIds[department]
      if (!parentId) {
        throw new Error(`Team or department does not exist: ${team}, ${department}`)
      }
      Volunteers.collections.lead.insert({
        ...rest,
        parentId,
      })
    })

    EventSettings.remove({})
    const { _id, ...newSettings } = settings
    EventSettings.insert(newSettings)
  },
})

export const cantinaSetupData = new ValidatedMethod({
  name: 'cantina.setup',
  mixins: [authMixins.isManager], // TODO allow cantina lead?
  validate: null,
  run() {
    const { buildPeriod } = EventSettings.findOne()
    const projectSignups = Volunteers.collections.signups.aggregate([
      {
        $match: {
          type: 'project',
          status: 'confirmed',
          start: {
            $lte: buildPeriod.end,
          },
          end: {
            $gte: buildPeriod.start,
          },
        },
      },
      {
        $lookup: {
          from: Volunteers.collections.volunteerForm._name,
          localField: 'userId',
          foreignField: 'userId',
          as: 'user',
        },
      },
      { $unwind: { path: '$user' } },
    ])

    const dietCountFacetStep = {
      total: [{
        $group: {
          _id: { month: '$_id.month', day: '$_id.day' },
          count: { $sum: 1 },
        },
      }],
    }
    dietGroups.forEach((dietGroup) => {
      dietCountFacetStep[dietGroup] = [
        {
          $match: {
            'user.food': dietGroup,
          },
        },
        {
          $group: {
            _id: { month: '$_id.month', day: '$_id.day' },
            count: { $sum: 1 },
          },
        },
      ]
    })
    allergies.forEach((allergy) => {
      dietCountFacetStep[`${allergy} allergy`] = [
        {
          $match: {
            'user.allergies': { $elemMatch: { $eq: allergy } },
          },
        },
        {
          $group: {
            _id: { month: '$_id.month', day: '$_id.day' },
            count: { $sum: 1 },
          },
        },
      ]
    })
    intolerances.forEach((intolerance) => {
      dietCountFacetStep[`${intolerance} intolerance`] = [
        {
          $match: {
            'user.intolerances': { $elemMatch: { $eq: intolerance } },
          },
        },
        {
          $group: {
            _id: { month: '$_id.month', day: '$_id.day' },
            count: { $sum: 1 },
          },
        },
      ]
    })
    const shiftSignups = Volunteers.collections.shift.aggregate([
      {
        $match: {
          start: {
            // Work around all dates needing a time which messes with days compared to common usage
            $lte: moment(buildPeriod.end).add(1, 'day').toDate(),
          },
          end: {
            $gte: buildPeriod.start,
          },
        },
      }, {
        $lookup: {
          from: Volunteers.collections.signups._name,
          localField: '_id',
          foreignField: 'shiftId',
          as: 'signup',
        },
      },
      { $unwind: { path: '$signup' } },
      { $match: { 'signup.status': 'confirmed' } },
      { $addFields: { hours: { $divide: [{ $subtract: ['$end', '$start'] }, 1000 * 60 * 60] } } },
      // Filter number of hours per shift here?
      {
        // Count up hours per day per volunteer
        $group: {
          _id: { month: { $month: '$start' }, day: { $dayOfMonth: '$start' }, userId: '$signup.userId' },
          hours: { $sum: '$hours' },
        },
      },
      // Filter total number of hours per day here?
      {
        $lookup: {
          from: Volunteers.collections.volunteerForm._name,
          localField: '_id.userId',
          foreignField: 'userId',
          as: 'user',
        },
      },
      { $unwind: { path: '$user' } },
      { $facet: dietCountFacetStep },
    ])[0]

    const buildRange = moment.range(buildPeriod.start, buildPeriod.end)
    return Array.from(buildRange.by('days')).map((day) => {
      const date = day.date()
      const month = day.month() + 1
      const dailyShiftData = _.object(Object.entries(shiftSignups).map(([dietType, dayCounts]) => {
        const data = dayCounts.find((daily) => daily._id.month === month && daily._id.day === date)
        return [dietType, data ? data.count : 0]
      }))

      const dailyProjectVols = projectSignups
        .filter((signup) => day.isSameOrAfter(signup.start) && day.isSameOrBefore(signup.end))
        .map((signup) => signup.user)
      const projectGroups = _.groupBy(dailyProjectVols, 'food')
      const allergyCounts = {}
      allergies.forEach((allergy) => {
        const allergyName = `${allergy} allergy`
        allergyCounts[allergyName] = dailyProjectVols
          .filter((vol) => vol.allergies.includes(allergy)).length
          + dailyShiftData[allergyName]
      })
      const intoleranceCounts = {}
      intolerances.forEach((intolerance) => {
        const intoleranceName = `${intolerance} intolerance`
        intoleranceCounts[intoleranceName] = dailyProjectVols
          .filter((vol) => vol.intolerances.includes(intolerance)).length
          + dailyShiftData[intoleranceName]
      })
      return {
        date: day.format('DD/MM/YYYY'),
        total: dailyProjectVols.length + dailyShiftData.total,
        omnivore: (projectGroups.omnivore || []).length + dailyShiftData.omnivore,
        vegetarian: (projectGroups.vegetarian || []).length + dailyShiftData.vegetarian,
        vegan: (projectGroups.vegan || []).length + dailyShiftData.vegan,
        fish: (projectGroups.fish || []).length + dailyShiftData.fish,
        ...allergyCounts,
        ...intoleranceCounts,
      }
    })
  },
})

export const getEmptyShifts = new ValidatedMethod({
  name: 'shifts.empty',
  mixins: [isNoInfoMixin],
  validate: null,
  run(day) {
    return Volunteers.collections.shift.aggregate([
      {
        $match: {
          policy: { $in: ['public', 'requireApproval'] },
          end: { $gt: day },
        },
      }, {
        $sort: { start: 1 },
      }, {
        $lookup: {
          from: Volunteers.collections.signups._name,
          localField: '_id',
          foreignField: 'shiftId',
          as: 'signups',
        },
      }, {
        $match: {
          $expr: {
            $lt: [
              { $size: '$signups' },
              '$max',
            ],
          },
        },
      }, {
        $limit: 10,
      }, {
        $lookup: {
          from: Volunteers.collections.team._name,
          localField: 'parentId',
          foreignField: '_id',
          as: 'team',
        },
      }, {
        $unwind: { path: '$team' },
      }, {
        $addFields: { type: 'shift' },
      },
    ])
  },
})

export const checkFistbumpHash = new ValidatedMethod({
  name: 'accounts.fistbump.check',
  mixins: [],
  validate: ({ hash }) => check(hash, Match.Maybe(String)),
  run({ hash }) {
    const result = serverCheckHash({ hash })
    // In practice any result should have an email, otherwise it would throw, but check anyway
    if (result.email) {
      const existingUser = Meteor.users.findOne({ 'emails.address': result.email })
      if (existingUser) {
        this.setUserId(existingUser._id)
        return { existingUser }
      }
    }
    return result
  },
})
