import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { _ } from 'meteor/underscore'
import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { Volunteers } from '../both/init'
import { getContext, WrapEmailSend } from './email'
import {
  isManagerMixin,
  isNoInfoMixin,
  isSameUserOrManagerMixin,
  isManagerOrLeadMixin,
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
  validate : null,
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

const sendNotificationEmailFunctionGeneric = ({
  user,
  userId,
  template,
  selector = {},
  isBulk = false,
}) => {
  const recipient = user || Meteor.users.findOne(userId)
  if (recipient) {
    const sel = {
      ...selector, userId, status: { $in: ['confirmed', 'pending'] },
    }
    if (template === 'reviewed') {
      sel.status.$in.push('refused')
    }
    // Use raw distinct?
    const signupIds = Volunteers.Collections.signups.find(sel).map(signup => signup._id)
    if (recipient && (signupIds.length > 0)) {
      const doc = EmailForms.previewTemplate(template, recipient, getContext)
      WrapEmailSend(recipient, doc, isBulk)
      Volunteers.Collections.signups.update({ _id: { $in: signupIds } },
        { $set: { notification: true } })
    }
  }
}

export const sendEnrollmentNotificationEmailFunction = userId =>
  sendNotificationEmailFunctionGeneric({
    userId,
    template: 'voluntell',
    selector: { enrolled: true },
    isBulk: true,
  })
export const sendReviewNotificationEmailFunction = (userId, isBulk = false) =>
  sendNotificationEmailFunctionGeneric({
    userId,
    template: 'reviewed',
    selector: { reviewed: true },
    isBulk,
  })

export const sendShiftReminderEmail = new ValidatedMethod({
  name: 'email.sendShiftReminder',
  validate: null,
  mixins: [isManagerMixin],
  run: userId => sendNotificationEmailFunctionGeneric({ userId, template: 'shiftReminder' }),
})

export const sendMassShiftReminderEmail = new ValidatedMethod({
  name: 'email.sendMassShiftReminder',
  validate: null,
  mixins: [isManagerMixin],
  run() {
    const users = Meteor.users.find({ isBanned: false, 'profile.formFilled': true }).fetch()
    const interval = Meteor.setInterval(() => {
      const user = users.pop()
      sendNotificationEmailFunctionGeneric({ user, template: 'shiftReminder', isBulk: true })
      if (users.length <= 0) {
        Meteor.clearInterval(interval)
      }
    }, 5000)
  },
})

export const sendReviewNotificationEmail = new ValidatedMethod({
  name: 'email.sendReviewNotifications',
  validate: null,
  mixins: [isManagerMixin],
  run: sendReviewNotificationEmailFunction,
})

export const userStats = new ValidatedMethod({
  name: 'users.stats',
  mixins: [isNoInfoMixin],
  validate: null,
  run() {
    const volunteers = Meteor.users.find().count()
    const bioFilled = Meteor.users.find({ 'profile.formFilled': true }).count()
    const leads = Meteor.users.find({ ticketId: { $exists: false } }).count()
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
  mixins: [isNoInfoMixin],
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
    return { count: usersCursor.count(), users: usersCursor.fetch() }
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
  mixins: [isManagerOrLeadMixin],
  validate: null,
  run: getTeamRotaCsv,
})

export const deptRotaData = new ValidatedMethod({
  name: 'dept.rota',
  mixins: [isManagerOrLeadMixin],
  validate: null,
  run({ parentId }) {
    return _.flatten(
      Volunteers.Collections.Team.find({ parentId })
        .map(team => getTeamRotaCsv({ parentId: team._id })
          .map(rotaItem => ({ ...rotaItem, team: team.name }))),
      true,
    )
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
          from: Volunteers.Collections.VolunteerForm._name,
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
    const shiftSignups = Volunteers.Collections.TeamShifts.aggregate([
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
          from: Volunteers.Collections.VolunteerForm._name,
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
        const data = dayCounts.find(daily => daily._id.month === month && daily._id.day === date)
        return [dietType, data ? data.count : 0]
      }))

      const dailyProjectVols = projectSignups
        .filter(signup => day.isSameOrAfter(signup.start) && day.isSameOrBefore(signup.end))
        .map(signup => signup.user)
      const projectGroups = _.groupBy(dailyProjectVols, 'food')
      const allergyCounts = {}
      allergies.forEach((allergy) => {
        const allergyName = `${allergy} allergy`
        allergyCounts[allergyName] = dailyProjectVols
          .filter(vol => vol.allergies.includes(allergy)).length
          + dailyShiftData[allergyName]
      })
      const intoleranceCounts = {}
      intolerances.forEach((intolerance) => {
        const intoleranceName = `${intolerance} intolerance`
        intoleranceCounts[intoleranceName] = dailyProjectVols
          .filter(vol => vol.intolerances.includes(intolerance)).length
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
    return Volunteers.Collections.TeamShifts.aggregate([
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
          from: Volunteers.Collections.Team._name,
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
