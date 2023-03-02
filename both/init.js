import { VolunteersClass } from 'meteor/goingnowhere:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { initLocale } from './locale'
// import { EventSettings } from './collections/settings'

// TODO For this we need to move everything to 'imports' and make sure we don't
// rely on auto loading. We'd also need to re-run everything on settings change
// const settings = EventSettings.findOne()
export const Volunteers = new VolunteersClass({
  eventName: 'nowhere2023',
  previousEventName: 'nowhere2022',
})

const roles = ['admin', 'manager']
// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, roles)

initLocale(Volunteers)
