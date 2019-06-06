import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { HTTP } from 'meteor/http'
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
import { config } from './config'
import {
  ticketsCollection,
  dietGroups,
  allergies,
  intolerances,
} from '../both/collections/users'
import { EventSettings } from '../both/collections/settings'

const moment = extendMoment(Moment)
moment.tz.setDefault('Europe/Paris')

Meteor.methods({
  sendVerificationEmail() {
    Accounts.sendVerificationEmail(this.userId)
  },
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

const sendNotificationEmailFunctionGeneric = (userId, template, selector, notification = false) => {
  if (userId) {
    const user = Meteor.users.findOne(userId)
    const sel = {
      ...selector, userId, status: { $in: ['confirmed', 'pending', 'refused'] },
    }
    if (notification) { sel.notification = notification }
    const shiftSignups = Volunteers.Collections.ShiftSignups.find(sel).map(s => _.extend(s, { type: 'shift' }))
    const leadSignups = Volunteers.Collections.LeadSignups.find(sel).map(s => _.extend(s, { type: 'lead' }))
    const projectSignups = Volunteers.Collections.ProjectSignups.find(sel).map(s => _.extend(s, { type: 'project' }))
    const allSignups = shiftSignups.concat(leadSignups).concat(projectSignups)
    if (user && (allSignups.length > 0)) {
      const doc = EmailForms.previewTemplate(template, user, getContext)
      WrapEmailSend(user, doc)
      allSignups.forEach((signup) => {
        const modifier = { $set: { notification: true } }
        switch (signup.type) {
          case 'shift':
            Volunteers.Collections.ShiftSignups.update(signup._id, modifier)
            break
          case 'project':
            Volunteers.Collections.ProjectSignups.update(signup._id, modifier)
            break
          case 'lead':
            Volunteers.Collections.LeadSignups.update(signup._id, modifier)
            break
          default:
        }
      })
    }
  }
}

export const sendEnrollmentNotificationEmailFunction = userId =>
  sendNotificationEmailFunctionGeneric(userId, 'voluntell', { enrolled: true })
export const sendReviewNotificationEmailFunction = userId =>
  sendNotificationEmailFunctionGeneric(userId, 'reviewed', { reviewed: true })

export const sendEnrollmentNotificationEmail = new ValidatedMethod({
  name: 'email.sendEnrollmentNotifications',
  validate: null,
  mixins: [isNoInfoMixin],
  run: userId => sendNotificationEmailFunctionGeneric(userId, 'shiftReminder', {}, null),
})

export const sendReviewNotificationEmail = new ValidatedMethod({
  name: 'email.sendReviewNotifications',
  validate: null,
  mixins: [isNoInfoMixin],
  run: sendReviewNotificationEmailFunction,
})

export const userStats = new ValidatedMethod({
  name: 'users.stats',
  validate: null,
  mixins: [isNoInfoMixin],
  run() {
    const volunteers = Meteor.users.find().count()
    const bioFilled = Meteor.users.find({ 'profile.formFilled': true }).count()
    const leads = Meteor.users.find({ ticketId: { $exists: false } }).count()
    const online = Meteor.users.find({ 'status.online': true }).count()
    const withDuties = Promise.await(Volunteers.Collections.ShiftSignups.rawCollection().distinct('userId'))
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

const prepTicketData = (guest) => {
  const ticketInfo = guest.TicketInformation
  return {
    _id: guest.TicketId,
    barcode: guest.Barcode,
    email: ticketInfo.Email.toLowerCase(),
    firstName: ticketInfo['First name'],
    lastName: ticketInfo.Surname,
    nickname: ticketInfo['What is your playa name (if you have one)?'],
    rawGuestInfo: guest,
  }
}

export const syncQuicketTicketList = new ValidatedMethod({
  name: 'ticketList.sync',
  mixins: [isManagerMixin],
  validate: null,
  run() {
    const { statusCode, data: { results, pages } } = HTTP.call('GET', `https://api.quicket.co.za/api/events/${config.quicketEventId}/guests`, {
      headers: {
        api_key: config.quicketApiKey,
        usertoken: config.quicketUserToken,
        pageSize: 10,
        page: 1,
        seasortByrch: 'DateAdded',
        sortDirection: 'DESC',
      },
    })
    if (statusCode !== 200) throw new Meteor.Error(500, 'Problem calling Quicket')
    if (pages !== 0) throw new Meteor.Error(501, 'Need to implement pagination')
    // const guestsByTicketId = results.reduce((map, guest) =>
    // map.set(guest.TicketId, guest), new Map()), 'TicketId')
    const guestsByTicketId = _.indexBy(results, 'TicketId')
    const ticketChanges = ticketsCollection.find({}, {
      barcode: true,
      email: true,
    }).map((ticket) => {
      const guest = guestsByTicketId[ticket._id]
      if (!guest) {
        ticketsCollection.remove({ _id: ticket._id })
        return null
      }
      const guestEmail = guest.TicketInformation.Email.toLowerCase()
      if (guestEmail !== ticket.email) {
        delete guestsByTicketId[ticket._id]
        return prepTicketData(guest)
      }
      if (!guest.TicketInformation.rawGuestInfo) {
        delete guestsByTicketId[ticket._id]
        return {
          _id: guest.TicketId,
          $set: {
            rawGuestInfo: guest,
          },
        }
      }
      return null
    }).filter(ticket => ticket)
    ticketChanges.concat(
      Object.keys(guestsByTicketId).map(ticketId => prepTicketData(guestsByTicketId[ticketId])),
    ).forEach(({ _id, ...update }) => {
      ticketsCollection.upsert({ _id }, update)
    })
  },
})

const mapCsvExport = {
  shift({ shift, user }) {
    return {
      shift: shift.title,
      start: moment(shift.start).format('DD/MM/YYYY HH:mm'),
      end: moment(shift.end).format('DD/MM/YYYY HH:mm'),
      name: user.profile.nickname || user.profile.firstName,
      email: user.emails[0].address,
      ticket: user.ticketId || '',
      fullName: `${user.profile.firstName} ${user.profile.lastName || ''}`,
    }
  },
  project({ shift, user, ...signup }) {
    return {
      shift: shift.title,
      start: moment(signup.start).format('DD/MM/YYYY'),
      end: moment(signup.end).format('DD/MM/YYYY'),
      name: user.profile.nickname || user.profile.firstName,
      email: user.emails[0].address,
      ticket: user.ticketId || '',
      fullName: `${user.profile.firstName} ${user.profile.lastName || ''}`,
    }
  },
}

const getTeamRotaCsv = ({ teamId }) => _.flatten([
  'shift',
  'project',
  // 'task',
].map(type => Volunteers.Collections.signupCollections[type].aggregate([
  {
    $match: {
      parentId: teamId,
      status: 'confirmed',
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
      from: Volunteers.Collections.dutiesCollections[type]._name,
      localField: 'shiftId',
      foreignField: '_id',
      as: 'shift',
    },
  },
  { $unwind: { path: '$shift' } },
]).map(mapCsvExport[type])))

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
  run({ deptId }) {
    return _.flatten(
      Volunteers.Collections.Team.find({ parentId: deptId })
        .map(team => getTeamRotaCsv({ teamId: team._id })
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
    const projectSignups = Volunteers.Collections.ProjectSignups.aggregate([
      {
        $match: {
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
          from: Volunteers.Collections.ShiftSignups._name,
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
