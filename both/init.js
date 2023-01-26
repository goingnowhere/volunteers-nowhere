import { Meteor } from 'meteor/meteor'
import { VolunteersClass } from 'meteor/goingnowhere:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { Roles } from 'meteor/alanning:roles'
import { initLocale } from './locale'

const eventName = 'nowhere2023'
export const Volunteers = new VolunteersClass(eventName)

const roles = ['admin', 'manager', 'user']
roles.forEach((role) => Roles.createRole(role, { unlessExists: true }))
// establish a hierarchy among roles
if (Meteor.isServer) {
  Roles.addRolesToParent('manager', 'admin')
  Roles.addRolesToParent('user', 'manager')
}

// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, roles)

initLocale(Volunteers)
