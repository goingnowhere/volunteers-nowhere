import { SyncedCron } from 'meteor/percolate:synced-cron'
import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/settings'
import { pendingUsers } from './importUsers'
import { EmailLogs, getContext, WrapEmailSend } from './email'
import {
  sendEnrollmentNotificationEmailFunction,
  sendReviewNotificationEmailFunction,
} from './methods'

moment.tz.setDefault('Europe/Paris')

const signupsGC = (time) => {
  SyncedCron.add({
    name: 'signupsGC',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const today = moment().subtract(7, 'days').startOf('day').toDate()
      const sel = { status: { $in: ['bailed'] }, createdAt: { $lt: today } }
      Volunteers.Collections.ShiftSignups.find(sel).forEach((signup) => {
        console.log('remove signup (bailed): GC ', signup)
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      })
      Volunteers.Collections.ShiftSignups.find().forEach((signup) => {
        const user = Meteor.users.findOne({ _id: signup.userId })
        if (!user) {
          console.log('remove signup: user not found', signup)
          Volunteers.Collections.ShiftSignups.remove(signup._id)
        }
        const shift = Volunteers.Collections.TeamShifts.findOne({ _id: signup.shiftId })
        if (!shift) {
          console.log('remove signup: shift not found', signup)
          Volunteers.Collections.ShiftSignups.remove(signup._id)
        }
        const team = Volunteers.Collections.Team.findOne({ _id: signup.parentId })
        if (!team) {
          console.log('remove signup: team not found', signup)
          Volunteers.Collections.ShiftSignups.remove(signup._id)
        }
      })
    },
  })
}

const EnrollmentTask = (time) => {
  SyncedCron.add({
    name: 'EnrollmentNotifications',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const sel = { enrolled: true, notification: false, status: 'confirmed' }
      const shiftSignups = Volunteers.Collections.ShiftSignups.find(sel, { limit: 10 }).map(s => _.extend(s, { type: 'shift' }))
      const leadSignups = Volunteers.Collections.LeadSignups.find(sel, { limit: 10 }).map(s => _.extend(s, { type: 'lead' }))
      const projectSignups = Volunteers.Collections.ProjectSignups.find(sel, { limit: 10 }).map(s => _.extend(s, { type: 'project' }))
      const allSignups = shiftSignups.concat(leadSignups).concat(projectSignups)

      Object.entries(_.groupBy(allSignups, 'userId')).forEach(([userId]) => {
        const user = Meteor.users.findOne(userId)
        console.log('send EnrollmentNotification to ', user.emails[0].address)

        sendEnrollmentNotificationEmailFunction(userId)
      })
    },
  })
}

const ReviewTask = (time) => {
  SyncedCron.add({
    name: 'ReviewNotifications',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const sel = {
        notification: false,
        reviewed: true,
        status: { $in: ['confirmed', 'refused'] },
      }
      const shiftSignups = Volunteers.Collections.ShiftSignups.find(sel, { limit: 10 }).map(s => _.extend(s, { type: 'shift' }))
      const leadSignups = Volunteers.Collections.LeadSignups.find(sel, { limit: 10 }).map(s => _.extend(s, { type: 'lead' }))
      const projectSignups = Volunteers.Collections.ProjectSignups.find(sel, { limit: 10 }).map(s => _.extend(s, { type: 'project' }))
      const allSignups = shiftSignups.concat(leadSignups).concat(projectSignups)

      Object.keys(_.groupBy(allSignups, 'userId')).forEach((userId) => {
        const user = Meteor.users.findOne(userId)
        console.log('Send Review Notification ', user.emails[0].address)
        sendReviewNotificationEmailFunction(userId)
      })
    },
  })
}

const MassEnrollmentTask = (time) => {
  SyncedCron.add({
    name: 'MassEnrollment',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const tid = EmailForms.Collections.EmailTemplate.findOne({ name: 'enrollAccount' })._id
      const sel = {
        'profile.terms': false,
        'profile.invitationSent': { $exists: false },
        'profile.ticketNumber': { $ne: 'Manual registration' },
        'emails.0.address': { $not: /@email.invalid/ },
      }
      Meteor.users.find(sel, { limit: 10 }).forEach((user) => {
        if (!EmailLogs.findOne({ template: tid, userId: user._id })) {
          try {
            console.log(`Sending enrollment to ${user.emails[0].address}`)
            Accounts.sendEnrollmentEmail(user._id)
          } catch (error) {
            console.log(`Error Sending enrollment to ${user.emails[0].address} : ${error}`)
          }
        } else {
          // if there is an email log, let's make sure to update this field as well
          Meteor.users.update(user._id, { $set: { 'profile.invitationSent': true } })
        }
      })
    },
  })
}

const MassEnrollmentInvalidEmailsTask = (time) => {
  SyncedCron.add({
    name: 'MassEnrollmentInvalidEmails',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const sel = {
        'profile.terms': false,
        'profile.invitationSent': false,
        'emails.0.address': /@email.invalid/,
      }
      Meteor.users.find(sel, { limit: 10 }).forEach((fakeUser) => {
        const fakeEmail = fakeUser.emails[0].address
        const pendingUser = pendingUsers.findOne({ fakeEmail })
        const mainUser = Accounts.findUserByEmail(pendingUser.Email)
        if (pendingUser && mainUser) {
          const doc = EmailForms.previewTemplate('enrollAccountInvalidEmail', mainUser, getContext)
          try {
            console.log(`Sending enrollment for ${fakeEmail} to ${pendingUser.Email}`)
            WrapEmailSend(mainUser, doc)
            Meteor.users.update(fakeUser._id, { $set: { 'profile.invitationSent': true } })
          } catch (error) {
            console.log(`Error Sending enrollment for ${fakeEmail} to ${pendingUser.Email} : ${error}`)
          }
        }
      })
    },
  })
}

SyncedCron.config({
  log: false,
})

const cronActivate = ({ cronFrequency }) => {
  if (cronFrequency) {
    console.log('Set Cron to ', cronFrequency)
    SyncedCron.stop()
    /* EnrollmentTask('every 10 mins') */
    /* ReviewTask('every 12 mins') */
    /* MassEnrollmentTask('every 15 mins') */
    /* MassEnrollmentInvalidEmailsTask('every 17 mins') */
    /* signupsGC('every 10 days') */
    /* SyncedCron.start() */
  } else {
    console.log('Disable Cron')
    SyncedCron.stop()
  }
}
// Reactive observer to enable / disable enrollment emails
EventSettings.find({}).observe({
  added: doc => cronActivate(doc),
  changed: doc => cronActivate(doc),
})
