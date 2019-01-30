import { EmailForms } from 'meteor/abate:email-forms'
import { Migrations } from 'meteor/percolate:migrations'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
// import { FormBuilder } from 'meteor/abate:formbuilder'
import moment from 'moment'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/settings'
// import { importUsers, Tickets } from './importUsers'
import { EmailLogs } from './email'
import {
  voluntellEmail,
  reminderEmail, reviewEmail, enrollInvalidEmail, earlyAdoptersEmail,
} from './migrationsData/migrationsData'

Migrations.config({
  log: true,
  logIfLatest: false,
})

Migrations.add({
  version: 1,
  name: 'add user and site context',
  up() {
    EmailForms.Collections.EmailTemplateContext.remove({})
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'User',
      namespace: 'user',
      variables: [
        { name: 'firstName', description: 'first name from profile' },
        { name: 'email', description: 'first verified email' },
      ],
    })
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Site',
      namespace: 'site',
      variables: [
        { name: 'url', description: 'absolute URL of the site' },
      ],
    })
  },
})

Migrations.add({
  version: 2,
  name: 'Make three admins',
  up() {
    const pm = Accounts.findUserByEmail('piemonkey@gmail.com')
    const dr = Accounts.findUserByEmail('dr.munga@gmail.com')
    const hc = Accounts.findUserByEmail('hardcastle@goingnowhere.org')
    if (pm) { Roles.addUsersToRoles(pm._id, 'admin') }
    if (dr) { Roles.addUsersToRoles(dr._id, 'admin') }
    if (hc) { Roles.addUsersToRoles(hc._id, 'admin') }
  },
})


// Migrations.add({
//   version: 3,
//   name: 'Move fod-name to user account',
//   up() {
//     const volunteerForm = FormBuilder.Collections.DynamicForms.findOne({ name: 'VolunteerForm' })
//     const fodNameField = volunteerForm.form.find(field => field.label.includes("Name / Field of Dirt (it's not a playa) Name"))
//     Volunteers.Collections.VolunteerForm.find().map((vol) => {
//       if (vol[fodNameField.name]) {
//         Meteor.users.update(vol.userId, { $set: { 'profile.nickname': vol[fodNameField.name] } })
//       }
//     })
//   },
// })

Migrations.add({
  version: 4,
  name: 'Update Profile for existing Users',
  up() {
    Meteor.users.find().fetch().forEach((user) => {
      Meteor.users.update({ _id: user._id }, {
        $set: {
          'profile.ticketNumber': 'Manual registration',
          'profile.ticketDate': new Date(),
          'profile.manualRegistration': true,
        },
      })
    })
  },
})

/* Migrations.add({
  version: 5,
  name: 'Add guest list guests-2018-05-14.json',
  up() {
    importUsers('users/guests-2018-05-14.json')
  },
})
 */
Migrations.add({
  version: 6,
  name: 'add user and site context',
  up() {
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Tickets',
      namespace: 'tickets',
      variables: [
        { name: 'users', description: 'additional tickets associated to this email' },

      ],
    })
  },
})

Migrations.add({
  version: 7,
  name: 'Cleanup removed shifts',
  up() {
    Volunteers.Collections.TeamShifts.find().forEach((shift) => {
      if (!Volunteers.Collections.Team.findOne(shift.parentId)) {
        console.log('remove stale shift ', shift.title)
        Volunteers.Collections.TeamShifts.remove(shift._id)
      }
    })
    Volunteers.Collections.ShiftSignups.find().forEach((signup) => {
      if (!Volunteers.Collections.TeamShifts.findOne(signup.shiftId)) {
        const user = Meteor.users.findOne(signup.userId)
        const team = Volunteers.Collections.Team.findOne(signup.parentId)
        const email = ((user) ? user.emails[0].address : '')
        const title = ((team) ? team.name : '')
        console.log(`remove stale signup for ${email} (${title})`)
        Volunteers.Collections.ShiftSignups.update(signup._id, { $set: { status: 'cancelled' } })
      }
    })
  },
})

Migrations.add({
  version: 8,
  name: 'Add RotaId to all existing rotas',
  up() {
    const allShifts = Volunteers.Collections.TeamShifts.find({ groupId: { $ne: null } }).fetch()
    console.log('Total Shifts ', allShifts.length)
    const grouppedShifts = _.groupBy(allShifts, 'groupId')
    console.log('Total Rotas ', Object.keys(grouppedShifts).length)
    Object.entries(grouppedShifts).forEach(([groupId, shifts]) => {
      const dayGrouppedShifts = _.groupBy(shifts, s => moment(s.start).dayOfYear())
      console.log('Total Sub Rotas by day', Object.keys(dayGrouppedShifts).length)
      Object.values(dayGrouppedShifts).forEach((shiftsByDay) => {
        _.sortBy(shiftsByDay, s => s.start)
        shiftsByDay.forEach((v, i) => {
          console.log(`update ${v.title} with rotaId ${i}`)
          Volunteers.Collections.TeamShifts.update(v._id, { $set: { rotaId: parseInt(i) } })
        })
      })
    })
  },
})

Migrations.add({
  version: 9,
  name: 'add lead, shift and project context',
  up() {
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Shifts',
      namespace: 'duties',
      variables: [
        {
          name: 'shifts', description: 'shifts signup associated to the user',
        },
      ],
    })
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Leads',
      namespace: 'duties',
      variables: [
        {
          name: 'leads', description: 'leads signup associated to the user',
        },
      ],
    })
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Projects',
      namespace: 'duties',
      variables: [
        {
          name: 'projects', description: 'projects signup associated to the user',
        },
      ],
    })
  },
})

const cleanSignups = (collection, shiftCollection, lead = false) => {
  collection.find().forEach((signup) => {
    const user = Meteor.users.findOne({ _id: signup.userId })
    if (!user) {
      console.log('remove signup: user not found')
      collection.remove(signup._id)
    }
    const shift = shiftCollection.findOne({ _id: signup.shiftId })
    if (!shift) {
      console.log('remove signup: shift not found')
      collection.remove(signup._id)
    }
    const team = Volunteers.Collections.Team.findOne({ _id: signup.parentId })
    if (!team) {
      if (lead) {
        const dept = Volunteers.Collections.Department.findOne({ _id: signup.parentId })
        if (!dept) {
          console.log('remove signup: team or dept not found')
          collection.remove(signup._id)
        }
      } else {
        console.log('remove signup: team not found')
        collection.remove(signup._id)
      }
    }
  })
}

Migrations.add({
  version: 10,
  name: 'cleanup shift signups',
  up() {
    cleanSignups(
      Volunteers.Collections.ShiftSignups,
      Volunteers.Collections.TeamShifts,
    )
    cleanSignups(
      Volunteers.Collections.ProjectSignups,
      Volunteers.Collections.Projects,
    )
    cleanSignups(
      Volunteers.Collections.LeadSignups,
      Volunteers.Collections.Lead,
      true,

    )
  },
})

Migrations.add({
  version: 11,
  name: 'Add and set EventSettings.cronFrequency (disable emails)',
  up() {
    EventSettings.update({}, { $set: { cronFrequency: '' } })
  },
})

Migrations.add({
  version: 12,
  name: 'Add voluntell email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'voluntell' }, {
      $set: { ...voluntellEmail, context },
    })
  },
})

Migrations.add({
  version: 13,
  name: 'Set Enrolled flag for all signups',
  up() {
    const modifier = { $set: { enrolled: true, notification: false } }
    Volunteers.Collections.ShiftSignups.update({}, modifier, { multi: true })
    Volunteers.Collections.ProjectSignups.update({}, modifier, { multi: true })
    Volunteers.Collections.LeadSignups.update({}, modifier, { multi: true })
  },
})

Migrations.add({
  version: 14,
  name: 'Add reviewed email template',
  up() {
    const sel = { name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }
    const context = EmailForms.Collections.EmailTemplateContext.find(sel).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'reviewed' }, {
      $set: { ...reviewEmail, context },
    })
  },
})

Migrations.add({
  version: 15,
  name: 'Fix voluntell email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'voluntell' }, {
      $set: { ...voluntellEmail, context },
    })
  },
})

Migrations.add({
  version: 16,
  name: 'Set Reviewed flag for all signups',
  up() {
    const sel = { status: 'pending', reviewed: null }
    const modifier = { $set: { reviewed: false } }
    Volunteers.Collections.ShiftSignups.update(sel, modifier, { multi: true })
    Volunteers.Collections.ProjectSignups.update(sel, modifier, { multi: true })
    Volunteers.Collections.LeadSignups.update(sel, modifier, { multi: true })
  },
})

Migrations.add({
  version: 17,
  name: 'shift reminder email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'shiftReminder' }, {
      $set: { ...reminderEmail, context },
    })
  },
})

Migrations.add({
  version: 18,
  name: 'Set invitationSent flag to all people with verified email',
  up() {
    const sel = { 'emails.$.verified': true }
    const modifier = { $set: { 'profile.invitationSent': true } }
    Meteor.users.update(sel, modifier, { multi: true })
    const tid = EmailForms.Collections.EmailTemplate.findOne({ name: 'enrollAccount' })._id
    EmailLogs.find({ template: tid }).forEach((log) => {
      Meteor.users.update(log._id, modifier, { multi: true })
    })
  },
})

Migrations.add({
  version: 19,
  name: 'Move rota from team to team',
  up() {
    const newTeam = Volunteers.Collections.Team.findOne({ name: 'Event-Time Maintenance' })
    const oldTeam = Volunteers.Collections.Team.findOne({ name: 'Site Leads' })
    if (newTeam) {
      Volunteers.Collections.TeamShifts.update(
        { title: 'Event-Time Maintenance Crew', parentId: oldTeam._id },
        { $set: { parentId: newTeam._id } },
        { multi: true },

      )
    }
  },
})

Migrations.add({
  version: 20,
  name: 'add afftected teams context',
  up() {
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'UserTeams',
      namespace: 'teams',
      variables: [
        { name: 'name', description: 'name of the team' },
        { name: 'email', description: 'contact email for the team' },
      ],
    })
  },
})

Migrations.add({
  version: 21,
  name: 'Run Once off GC',
  up() {
    const today = moment().subtract(7, 'days').startOf('day').toDate()
    const sel = { status: { $in: ['bailed'] }, createdAt: { $lt: today } }
    Volunteers.Collections.ShiftSignups.find(sel).forEach((signup) => {
      Volunteers.Collections.ShiftSignups.remove(signup._id)
    })
    Volunteers.Collections.ShiftSignups.find().forEach((signup) => {
      const user = Meteor.users.findOne({ _id: signup.userId })
      if (!user) {
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      }
      const shift = Volunteers.Collections.TeamShifts.findOne({ _id: signup.shiftId })
      if (!shift) {
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      }
      const team = Volunteers.Collections.Team.findOne({ _id: signup.parentId })
      if (!team) {
        Volunteers.Collections.ShiftSignups.remove(signup._id)
      }
    })
  },
})

Migrations.add({
  version: 22,
  name: 'add enrollAccountInvalidEmail email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Tickets'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'enrollAccountInvalidEmail' }, {
      $set: { ...enrollInvalidEmail, context },
    })
  },
})

Migrations.add({
  version: 23,
  name: 'reset invitationSent flag for invalid emails',
  up() {
    Meteor.users.update({ 'emails.0.address': /@email.invalid/ }, { $set: { 'profile.invitationSent': false } }, { multi: true })
  },
})

Migrations.add({
  version: 24,
  name: 'fix invitationSent for users already on the system',
  up() {
    Meteor.users.update({ 'profile.terms': true }, { $set: { 'profile.invitationSent': true } }, { multi: true })
  },
})

Migrations.add({
  version: 25,
  name: 'Associate ticket number to users',
  up() {
    let ticketNumber
    console.log('initialize tickets collection ', Tickets.remove({}))
    Meteor.users.find().forEach((user) => {
      if (user.profile.ticketNumber === 'Manual registration') {
        ticketNumber = 0
      } else {
        ticketNumber = Number(user.profile.ticketNumber)
      }
      Meteor.users.update(user._id, { $set: { 'profile.ticketNumber': ticketNumber } })
      if (ticketNumber !== 0) {
        const email = ((user.emails.length > 0) ? user.emails[0].address : '')
        Tickets.insert({ userId: user._id, ticketNumber, email })
      }
    })
  },
})

/* Migrations.add({
  version: 26,
  name: 'Add guest list guests-2018-05-21.json',
  up() {
    importUsers('users/guests-2018-05-21.json')
  },
})
 */
Migrations.add({
  version: 27,
  name: 'add earlyAdoptersEmail email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'earlyAdoptersEmail' }, {
      $set: { ...earlyAdoptersEmail, context },
    })
  },
})

/* Migrations.add({
  version: 28,
  name: 'Add guest list guests-2018-06-03.json',
  up() {
    importUsers('users/guests-2018-06-03.json')
  },
}) */

/* Migrations.add({
  version: 29,
  name: 'Recover nomad shifts and signups',
  up() {
    const shiftFile = 'users/nomads.shifts'
    const shifts = JSON.parse(Assets.getText(shiftFile))
    shifts.forEach((s) => {
      Volunteers.Collections.TeamShifts.insert(s)
    })
  },
}) */

/* Migrations.add({
  version: 30,
  name: 'Add guest list guests-2018-06-10T23_00_10+02_00.json',
  up() {
    importUsers('users/guests-2018-06-10T23_00_10+02_00.json')
  },
}) */

/* Migrations.add({
  version: 31,
  name: 'Recover nomad shifts and signups',
  up() {
    const shiftFile = 'users/nomads.shifts'
    const shifts = JSON.parse(Assets.getText(shiftFile))
    shifts.forEach((s) => {
      Volunteers.Collections.TeamShifts.upsert(s._id, { $set: _.omit(s, '_id') })
    })
  },
})
 */

Migrations.add({
  version: 32,
  name: 'Recover nomad shifts and signups',
  up() {
    /* const shiftFile = 'users/nomads.signups'
    Volunteers.Collections.ShiftSignups.remove({ parentId: 'mdv7jkFCpcy3n7JDC' })
    const shifts = JSON.parse(Assets.getText(shiftFile))
    shifts.forEach((s) => {
      console.log(s)
      Volunteers.Collections.ShiftSignups.insert(s)
    }) */
  },
})

Migrations.add({
  version: 33,
  name: 'Add guest list guests-2018-06-16.json',
  up() {
    /* importUsers('users/guests-2018-06-16.json') */
  },
})

Migrations.add({
  version: 34,
  name: 'Fix ban error',
  up() {
    /* Meteor.users.update({ 'emails.$.address': 'lindseytreloar@gmail.com' }, {
      $set: { 'profile.ticketNumber': 5788342, 'profile.invitationSent': false },
    })
    Meteor.users.update({ 'emails.$.address': 'Reuvenic@gmail.com' }, {
      $set: { 'profile.ticketNumber': 5798670, 'profile.invitationSent': false },
    }) */
  },
})

Migrations.add({
  version: 35,
  name: 'Add guest list guests-2018-06-16.json',
  up() {
    /* importUsers('users/guests-2018-06-16.json') */
  },
})

// Migrations.add({
//   version: 36,
//   name: 'Add guest list guests-2018-06-16.json',
//   up() {
//     importUsers('users/guests-2018-06-16.json')
//   },

// })
