import { VolunteersClass } from 'meteor/goingnowhere:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { initLocale } from './locale'
import { EventSettings } from './collections/settings'

// TODO For this we need to move everything to 'imports' and make sure we don't
// rely on auto loading. We'd also need to re-run everything on settings change
// const settings = EventSettings.findOne()
// For now, pass the settings collection in and use that where appropriate
export const Volunteers = new VolunteersClass({
  eventName: 'nowhere2024',
  previousEventName: 'nowhere2023',
  SettingsCollection: EventSettings,
})

// this is exported to handle the publication of the ProfilePictures
// Note: we pass in empty roles array as we create our own roles
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, [])

initLocale(Volunteers)
