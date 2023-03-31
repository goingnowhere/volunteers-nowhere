import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SyncedCron } from 'meteor/littledata:synced-cron'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/collections/settings'
import {
  sendEnrollmentEmail,
  sendReviewEmail,
  sendCachedEmails,
} from './email'
import { checkForTicketUpdate } from './quicket'

const signupGcBackup = new Mongo.Collection('signupGcBackup')

const signupsGC = (time) => {
  SyncedCron.add({
    name: 'signupsGC',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      ['lead', 'shift', 'project'].forEach((duty) => {
        Volunteers.collections.signups.aggregate([{
          $match: {
            type: duty,
            status: {
              $in: ['confirmed', 'pending'],
            },
          },
        }, {
          $lookup: {
            from: Volunteers.collections.dutiesCollections[duty]._name,
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
          Volunteers.collections.signups.remove(signup._id)
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
      const signups = Volunteers.collections.signups.find(sel, { userId: true })

      new Set(signups.map((signup) => signup.userId)).forEach((userId) => {
        sendEnrollmentEmail(userId)
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
        // Don't pick up voluntold people as they get the enrollment email
        enrolled: false,
        reviewed: true,
        status: { $in: ['confirmed', 'refused'] },
      }
      const signups = Volunteers.collections.signups.find(sel)

      new Set(signups.map((signup) => signup.userId)).forEach((userId) => {
        sendReviewEmail(userId, true)
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

/** Go through all users and check for invalid or missing ticketIds */
function checkUserTickets(checkAll) {
  const query = checkAll
    ? {}
    : { $or: [{ ticketId: { $lt: 10000 } }, { ticketId: { $exists: false } }] }
  Meteor.users.find(query)
    .map((user) => {
      const ticket = checkForTicketUpdate(user)
      return ticket && [user, ticket]
    })
    .filter(Boolean)
    .forEach(([user, ticket]) => {
      console.log(`Updating ${user._id} to have ticket ${ticket.TicketId} from ${user.ticketId}`, user.emails)
      Meteor.users.update({ _id: user._id }, { $set: { ticketId: ticket.TicketId } })
    })
}

const checkForMissingTickets = (time) => {
  SyncedCron.add({
    name: 'MissingTicketCheck',
    schedule(parser) {
      return parser.text(time)
    },
    job: () => checkUserTickets(false),
  })
}

// const checkAllTickets = (time) => {
//   SyncedCron.add({
//     name: 'MissingTicketCheck',
//     schedule(parser) {
//       return parser.text(time)
//     },
//     job: () => checkUserTickets(false),
//   })
// }

const cronActivate = ({ cronFrequency, emailManualCheck }) => {
  if (cronFrequency) {
    console.log('Set Cron to ', cronFrequency)
    SyncedCron.stop()

    EnrollmentTask(`every ${cronFrequency}`)
    ReviewTask(`every ${cronFrequency}`)

    if (!emailManualCheck) {
      emailSend('every 5 minutes')
    }

    signupsGC('at 03:00 every 3 days')
    // if (Meteor.isProduction) {
    //   checkForMissingTickets('at 04:00 every day')
    //   // TODO handle manually set ticket checks and then turn this on
    //   // checkAllTickets('at 04:00 every day'
    // }
    SyncedCron.start()
  } else {
    console.log('Disable Cron')
    SyncedCron.stop()
  }
}
// Reactive observer to enable / disable enrollment emails
EventSettings.find({}).observe({
  added: cronActivate,
  changed: cronActivate,
})
