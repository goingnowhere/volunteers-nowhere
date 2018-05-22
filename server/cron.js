import { SyncedCron } from 'meteor/percolate:synced-cron'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/settings'
import { sendNotificationEmailFunction } from './methods'

/* SyncedCron.add({
  name: 'Cleanup old signups',
  schedule(parser) {
    return parser.text('every 1 mins')
  },
  job() {
    Volunteers.Collections.ShiftSignups.find().forEach((signup) => {
      const user = Meteor.users.findOne({ _id: signup.userId })
      if (!user) {
        console.log('remove signup: user not found')
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      }
      const shift = Volunteers.Collections.TeamShifts.findOne({ _id: signup.shiftId })
      if (!shift) {
        console.log('remove signup: shift not found')
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      }
      const team = Volunteers.Collections.Team.findOne({ _id: signup.parentId })
      if (!team) {
        console.log('remove signup: team not found')
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      }
    })
  },
}) */

const EnrollmentTask = (time) => {
  SyncedCron.add({
    name: 'EnrollmentNotifications',
    schedule(parser) {
      return parser.text(time)
    },
    job() {
      const sel = { enrolled: true, notification: false }
      const shiftSignups = Volunteers.Collections.ShiftSignups.find(sel).map(s => _.extend(s, { type: 'shift' }))
      const leadSignups = Volunteers.Collections.LeadSignups.find(sel).map(s => _.extend(s, { type: 'lead' }))
      const projectSignups = Volunteers.Collections.ProjectSignups.find(sel).map(s => _.extend(s, { type: 'project' }))
      const allSignups = shiftSignups.concat(leadSignups).concat(projectSignups)

      Object.entries(_.groupBy(allSignups, 'userId')).forEach(([userId]) => {
        sendNotificationEmailFunction(userId)
      })
    },
  })
}

const cronActivate = ({ cronFrequency }) => {
  if (cronFrequency) {
    console.log('Set Enrollment emails to ', cronFrequency)
    SyncedCron.stop()
    EnrollmentTask(cronFrequency)
    SyncedCron.start()
  } else {
    console.log('Disable Enrollment emails')
    SyncedCron.stop()
  }
}
// Reactive observer to enable / disable enrollment emails
EventSettings.find().observe({
  added: doc => cronActivate(doc),
  changed: doc => cronActivate(doc),
})
