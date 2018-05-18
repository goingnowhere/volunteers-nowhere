import { EmailForms } from 'meteor/abate:email-forms'
import { Migrations } from 'meteor/percolate:migrations'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import { FormBuilder } from 'meteor/abate:formbuilder'
import { Volunteers } from '../both/init'
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
