import { EmailForms } from 'meteor/abate:email-forms'
import { Migrations } from 'meteor/percolate:migrations'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import { FormBuilder } from 'meteor/abate:formbuilder'
import { Volunteers } from '../both/init'

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
