import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { _ } from 'meteor/underscore'
import { Match } from 'meteor/check'
import { Roles } from 'meteor/piemonkey:roles'
import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { VolunteersClass } from 'meteor/goingnowhere:volunteers'
import { Volunteers } from '../both/init'
import {
  isManagerMixin,
  isNoInfoMixin,
  isSameUserOrManagerMixin,
  isLeadMixin,
  isAnyLeadMixin,
} from '../both/authMixins'
import {
  dietGroups,
  allergies,
  intolerances,
} from '../both/collections/users'
import { EventSettings } from '../both/collections/settings'
import { syncQuicketTicketList } from './quicket'

const moment = extendMoment(Moment)

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
  mixins: [isManagerMixin],
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
  mixins: [isSameUserOrManagerMixin],
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
    const volunteers = Meteor.users.find().count()
    const bioFilled = Meteor.users.find({ 'profile.formFilled': true }).count()
    const leads = Volunteers.Collections.signups.find({ type: 'lead', status: 'confirmed' }).count()
    const online = Meteor.users.find({ 'status.online': true }).count()
    const withDuties = Promise.await(Volunteers.Collections.signups.rawCollection().distinct('userId'))
    const withPicture = Meteor.users.find({ 'profile.picture': { $exists: true } }).count()
    return {
      volunteers,
      bioFilled,
      withDuties: withDuties.length,
      withPicture,
      leads,
      online,
    }
  },
})

export const userList = new ValidatedMethod({
  name: 'users.paged',
  mixins: [isAnyLeadMixin],
  validate: () => {},
  run({ search = {}, page, perPage = 20 }) {
    const usersCursor = Meteor.users.find(search, {
      sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
      skip: (page - 1) * perPage,
      limit: perPage,
      // TODO We shouldn't need much here, now that the methods are separated we should remove
      // what we don't need
      fields: {
        profile: true,
        emails: true,
        isBanned: true,
        status: true,
        createdAt: true,
        roles: true,
      },
    })
    return { count: usersCursor.count(), users: usersCursor.fetch() }
  },
})

export const userListManager = new ValidatedMethod({
  name: 'users.paged.manager',
  mixins: [isManagerMixin],
  validate: () => {},
  run({ search = {}, page, perPage = 20 }) {
    const usersCursor = Meteor.users.find(search, {
      sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
      skip: (page - 1) * perPage,
      limit: perPage,
      fields: {
        profile: true,
        emails: true,
        isBanned: true,
        status: true,
        createdAt: true,
        roles: true,
      },
    })
    return {
      count: usersCursor.count(),
      users: usersCursor.fetch(),
      extras:
        Object.fromEntries(usersCursor.map(user => [
          user._id,
          { roles: Roles.getRolesForUser(user._id, { scope: Volunteers.eventName }) },
        ])),
    }
  },
})

export const syncQuicketTicketListMethod = new ValidatedMethod({
  name: 'ticketList.sync',
  mixins: [isManagerMixin],
  validate: null,
  run: syncQuicketTicketList,
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

const getTeamRotaCsv = ({ parentId }) => Volunteers.Collections.signups.aggregate([
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
      from: Volunteers.Collections.dutiesCollections.shift._name,
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
      from: Volunteers.Collections.dutiesCollections.project._name,
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
]).map(mapCsvExport)

export const teamRotaData = new ValidatedMethod({
  name: 'team.rota',
  mixins: [isLeadMixin],
  validate: null,
  run: getTeamRotaCsv,
})

export const deptRotaData = new ValidatedMethod({
  name: 'dept.rota',
  mixins: [isLeadMixin],
  validate: null,
  run({ parentId }) {
    return _.flatten(
      Volunteers.Collections.team.find({ parentId })
        .map((team) => getTeamRotaCsv({ parentId: team._id })
          .map((rotaItem) => ({ ...rotaItem, team: team.name }))),
      true,
    )
  },
})

/**
 * Export team structure, rotas and settings as JSON so they can be updated for the next
 * year and re-imported.
 */
export const allRotaExport = new ValidatedMethod({
  name: 'rota.all.export',
  mixins: [isManagerMixin],
  validate: null,
  run({ eventName }) {
    const sourceEvent = new VolunteersClass(eventName, true)
    // This is weird as this one isn't part of the 'volunteers' class, so we can't
    // migrate it easily. Either some of the settings should be pulled in or there
    // should be a better migration strategy
    const settings = EventSettings.findOne()
    const department = sourceEvent.Collections.department.find().fetch()
    const team = sourceEvent.Collections.team.find().fetch()
    const rotas = sourceEvent.Collections.rotas.find().fetch()
    const shift = sourceEvent.Collections.shift.find().fetch()
    const project = sourceEvent.Collections.project.find().fetch()
    const lead = sourceEvent.Collections.lead.find().fetch()

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
  mixins: [isManagerMixin],
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

    const divId = Volunteers.Collections.division.findOne()._id

    const deptIds = {}
    Volunteers.Collections.department.remove({})
    departments.forEach(dept => {
      const deptId = Volunteers.Collections.department.insert({
        ...dept,
        parentId: divId,
      })
      Roles.createRole(deptId)
      Roles.addRolesToParent(deptId, divId)
      deptIds[dept.name] = deptId
    })

    const teamIds = {}
    Volunteers.Collections.team.remove({})
    teams.forEach(({ department, ...rest }) => {
      const parentId = deptIds[department]
      if (!parentId) {
        throw new Error(`Department does not exist: ${department}`)
      }
      const teamId = Volunteers.Collections.team.insert({
        ...rest,
        parentId,
      })
      Roles.createRole(teamId)
      Roles.addRolesToParent(teamId, parentId)
      teamIds[rest.name] = teamId
    })

    const nonUniqueRotaNames = {}
    const rotaIds = {}
    Volunteers.Collections.rotas.remove({})
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
      const rotaId = Volunteers.Collections.rotas.insert({
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

    Volunteers.Collections.shift.remove({})
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
      Volunteers.Collections.shift.insert({
        ...rest,
        rotaId,
        parentId,
        start: moment(start).add(eventStartDiff, 'days').toDate(),
        end: moment(end).add(eventStartDiff, 'days').toDate(),
      })
    })

    Volunteers.Collections.project.remove({})
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
      Volunteers.Collections.project.insert({
        ...rest,
        parentId,
        start: moment(start).add(eventStartDiff, 'days').toDate(),
        end: moment(end).add(eventStartDiff, 'days').toDate(),
      })
    })

    Volunteers.Collections.lead.remove({})
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
      Volunteers.Collections.lead.insert({
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
  mixins: [isManagerMixin], // TODO allow cantina lead?
  validate: null,
  run() {
    const { buildPeriod } = EventSettings.findOne()
    const projectSignups = Volunteers.Collections.signups.aggregate([
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
          from: Volunteers.Collections.volunteerForm._name,
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
    const shiftSignups = Volunteers.Collections.shift.aggregate([
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
          from: Volunteers.Collections.signups._name,
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
          from: Volunteers.Collections.volunteerForm._name,
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
    return Volunteers.Collections.shift.aggregate([
      {
        $match: {
          end: { $gt: day },
        },
      }, {
        $sort: { start: 1 },
      }, {
        $lookup: {
          from: Volunteers.Collections.signups._name,
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
          from: Volunteers.Collections.team._name,
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
