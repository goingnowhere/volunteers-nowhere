import { Volunteers } from '../both/init'
import { MeteorProfile } from '../both/users'

Meteor.publish(`${Volunteers.eventName}.allUsers`, function () {
  // XXX there should be a way to publish only those
  // users that signed up for this event, but not others.
  if (Volunteers.isManager) return Meteor.users.find()
  return []
})

Meteor.publish('meteor-user-profiles.ProfilePictures', function () {
  if (this.userId) {
    return MeteorProfile.ProfilePictures.find({userId: this.userId}).cursor
  }
})
