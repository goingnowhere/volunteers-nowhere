import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SyncedCron } from 'meteor/littledata:synced-cron'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/collections/settings'
import {
  sendEnrollmentNotificationEmailFunction,
  sendReviewNotificationEmailFunction,
} from './methods'
import { sendCachedEmails } from './email'
import { syncQuicketTicketList } from './quicket'

const signupGcBackup = new Mongo.Collection('signupGcBackup')

const signupsGC = (time) => {
  SyncedCron.add({
    name: 'signupsGC',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      ['lead', 'shift', 'project'].forEach((duty) => {
        Volunteers.Collections.signupCollections[duty].aggregate([{
          $match: {
            status: {
              $in: ['confirmed', 'pending'],
            },
          },
        }, {
          $lookup: {
            from: Volunteers.Collections.dutiesCollections[duty]._name,
            localField: 'shiftId',
            foreignField: '_id',
            as: 'shift',
          },
        }, {
          $match: {
            shift: {
              $size: 0,
            },
          },
        }]).forEach((signup) => {
          console.log(`remove signup: ${duty} not found`, signup)
          signupGcBackup.insert({ duty, signup })
          Volunteers.Collections.signupCollections[duty].remove(signup._id)
        })
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
        sendReviewNotificationEmailFunction(userId, true)
      })
    },
  })
}

const emailSend = (time) => {
  // Send cached emails
  SyncedCron.add({
    name: 'EmailCache',
    schedule(parser) {
      return parser.text(time)
    },
    job: sendCachedEmails,
  })
}

const quicketSync = (time) => {
  // Sync list of tickets with Quicket
  SyncedCron.add({
    name: 'QuicketSync',
    schedule(parser) {
      return parser.text(time)
    },
    job: syncQuicketTicketList,
  })
}

const cronActivate = ({ cronFrequency }) => {
  if (cronFrequency) {
    console.log('Set Cron to ', cronFrequency)
    SyncedCron.stop()

    EnrollmentTask(`every ${cronFrequency}`)
    ReviewTask(`every ${cronFrequency}`)

    emailSend('every 5 minutes')
    signupsGC('every 3 days')
    if (Meteor.isProduction) {
      quicketSync('every 30 minutes')
    }
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
