import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { HTTP } from 'meteor/http'
import { _ } from 'meteor/underscore'
import { Volunteers } from '../both/init'
import { getContext, WrapEmailSend } from './email'
import {
  isManagerMixin,
  isNoInfoMixin,
  isSameUserOrManagerMixin,
  isManagerOrLeadMixin,
} from '../both/authMixins'
import { config } from './config'
import { ticketsCollection } from '../both/collections/users'

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

export const userStats = ({
  name: 'users.stats',
  validate: null,
  mixins: [isNoInfoMixin],
  run() {
    const ticketHolders = Meteor.users.find({ 'profile.ticketNumber': { $ne: 0 } }).count()
    const enrollmentSent = Meteor.users.find({ 'profile.invitationSent': true }).count()
    const enrollmentAck = Meteor.users.find({
      'profile.invitationSent': true,
      'profile.terms': true,
      'profile.ticketNumber': { $ne: 0 },
    }).count()
    const manualRegistration = Meteor.users.find({
      'profile.ticketNumber': 0,
      'profile.terms': true,
    }).count()
    const online = Meteor.users.find({ 'status.online': true }).count()
    const profileFilled = Volunteers.Collections.VolunteerForm.find().count()
    const withDuties = Promise.await(Volunteers.Collections.ShiftSignups.rawCollection().distinct('userId'))
    const withPicture = Meteor.users.find({ 'profile.picture': { $exists: true } }).count()
    return {
      ticketHolders,
      enrollmentSent,
      enrollmentAck,
      profileFilled,
      withDuties: withDuties.length,
      withPicture,
      manualRegistration,
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
    // const guestsByTicketId = results.reduce((map, guest) => map.set(guest.TicketId, guest), new Map()), 'TicketId')
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
