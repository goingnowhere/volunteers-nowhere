import { EmailForms } from 'meteor/abate:email-forms'
import { Migrations } from 'meteor/percolate:migrations'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import { FormBuilder } from 'meteor/abate:formbuilder'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/settings'
import { importUsers } from './importUsers'

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


Migrations.add({
  version: 3,
  name: 'Move fod-name to user account',
  up() {
    const volunteerForm = FormBuilder.Collections.DynamicForms.findOne({ name: 'VolunteerForm' })
    const fodNameField = volunteerForm.form.find(field => field.label.includes("Name / Field of Dirt (it's not a playa) Name"))
    Volunteers.Collections.VolunteerForm.find().map((vol) => {
      if (vol[fodNameField.name]) {
        Meteor.users.update(vol.userId, { $set: { 'profile.nickname': vol[fodNameField.name] } })
      }
    })
  },
})

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

Migrations.add({
  version: 5,
  name: 'Add guest list guests-2018-05-14.json',
  up() {
    importUsers('users/guests-2018-05-14.json')
  },
})

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

const cleanSignups = (collection) => {
  collection.find().forEach((signup) => {
    const user = Meteor.users.findOne({ _id: signup.userId })
    if (!user) {
      console.log('remove signup: user not found')
      collection.remove(signup._id)
    }
    const shift = Volunteers.Collections.TeamShifts.findOne({ _id: signup.shiftId })
    if (!shift) {
      console.log('remove signup: shift not found')
      collection.remove(signup._id)
    }
    const team = Volunteers.Collections.Team.findOne({ _id: signup.parentId })
    if (!team) {
      console.log('remove signup: team not found')
      collection.remove(signup._id)
    }
  })
}

Migrations.add({
  version: 10,
  name: 'cleanup shift signups',
  up() {
    cleanSignups(Volunteers.Collections.ShiftSignups)
    cleanSignups(Volunteers.Collections.ProjectSignups)
  },
})

Migrations.add({
  version: 11,
  name: 'Add and set EventSettings.cronFrequency (disable emails)',
  up() {
    EventSettings.update({}, { $set: { cronFrequency: '' } })
  },
})

/* Migrations.add({
  version: 11,
  name: 'Set Enrolled flag for all signups',
  up() {
    const modifier = { $set: { enrolled: true, notification: false } }
    Volunteers.Collections.ShiftSignups.update({}, modifier, { multi: true })
    Volunteers.Collections.ProjectSignups.update({}, modifier, { multi: true })
    Volunteers.Collections.LeadSignups.update({}, modifier, { multi: true })
  },
})
 */
