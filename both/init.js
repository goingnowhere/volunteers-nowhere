import { VolunteersClass } from 'meteor/abate:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { Roles } from 'meteor/piemonkey:roles'

export const Volunteers = new VolunteersClass('nowhere2018')

const roles = ['admin', 'manager', 'user']
// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, roles)

// establish a hierarchy among roles
if (Meteor.isServer) {
  Roles.addRolesToParent('manager', 'admin')
  Roles.addRolesToParent('user', 'manager')
}
