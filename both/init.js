import { VolunteersClass } from 'meteor/abate:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { Roles } from 'meteor/piemonkey:roles'
import moment from 'moment-timezone'
import i18n from 'meteor/universe:i18n'

export const Volunteers = new VolunteersClass('nowhere2018')

const roles = ['admin', 'manager', 'user']
roles.forEach(role => Roles.createRole(role, { unlessExists: true }))
// establish a hierarchy among roles
if (Meteor.isServer) {
  Roles.addRolesToParent('manager', 'admin')
  Roles.addRolesToParent('user', 'manager')
}

// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, roles)

// XXX adding the meoter timezone package for us to load all
// the timezone file (lot of useless Kb) . This can be avoided
// using the npm package
moment.tz.setDefault('Europe/Paris')
Volunteers.setTimeZone('Europe/Paris')

moment.locale('en-US')

// For some reason the default en locale has the wrong first day of the week
moment.updateLocale('en', { week: { dow: 1 } })

// default language
i18n.setLocale('en-US')
