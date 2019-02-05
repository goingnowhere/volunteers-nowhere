import { SyncedCron } from 'meteor/littledata:synced-cron'
import { EmailForms } from 'meteor/abate:email-forms'
import moment from 'moment-timezone'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/collections/settings'
import { getContext, WrapEmailSend } from './email'
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
  // Notify volunteers who get signed up for things
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
  // Notify volunteers who've had things they applied for approved/denied
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

// TODO update and re-use for @gn email users who don't have linked tickets
const EarlyAdopterEmailsTask = (time) => {
  // Email users with no ticket to get them to link their ticket email
  SyncedCron.add({
    name: 'EarlyAdopterEmails',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const sel = { 'profile.ticketNumber': 0 }
      Meteor.users.find(sel, { limit: 10 }).forEach((user) => {
        const doc = EmailForms.previewTemplate('earlyAdoptersEmail', user, getContext)
        try {
          console.log(`Sending early adopters remident for ${user.emails[0].address}`)
          WrapEmailSend(user, doc)
        } catch (error) {
          console.log(`Sending early adopters remident for ${user.emails[0].address}: ${error}`)
        }
      })
    },
  })
}

// TODO also re-use for @gn emails
const EarlyAdopterFixTicketTask = (time) => {
  SyncedCron.add({
    name: 'EarlyAdopterFixTicket',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const sel = { 'profile.ticketNumber': 0 }
      Meteor.users.find(sel).forEach((user) => {
        const emails = user.emails.map(email => _.pluck(email, 'address'))
        emails.forEach((address) => {
          const tickets = Tickets.find({ email: address }).fetch()
          if (tickets.length === 1) {
            console.log(`fix ticker numer for ${emails[0]}`)
            Meteor.users.update(user._id, { $set: { 'profile.ticketNumber': tickets[0].ticketNumber } })
          } else if (tickets.length > 1) {
            console.log('Double snowflake ', emails, tickets)
          }
        })
      })
    },
  })
}

const cronActivate = ({ cronFrequency }) => {
  if (cronFrequency) {
    console.log('Set Cron to ', cronFrequency)
    SyncedCron.stop()

    EnrollmentTask('every 10 mins')
    ReviewTask('every 12 mins')

    // EarlyAdopterEmailsTask('every 30 mins')
    // EarlyAdopterFixTicketTask('every 30 mins')
    signupsGC('every 10 days')
    SyncedCron.start()
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
