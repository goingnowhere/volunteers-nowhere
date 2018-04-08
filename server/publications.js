import { MeteorProfile, Volunteers } from '../both/init'

Meteor.publish('meteor-user-profiles.ProfilePictures', function publishProfilePictures(userId) {
  if (!userId) { userId = this.userId }
  if (this.userId === userId || Volunteers.isManagerOrLead(this.userId)) {
    return MeteorProfile.ProfilePictures.find({ userId: this.userId }).cursor
  }
  return []
})
