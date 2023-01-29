import { VolunteersClass } from 'meteor/goingnowhere:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { initLocale } from './locale'

const eventName = 'nowhere2023'
export const Volunteers = new VolunteersClass(eventName)

const roles = ['admin', 'manager']
// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, roles)

initLocale(Volunteers)
