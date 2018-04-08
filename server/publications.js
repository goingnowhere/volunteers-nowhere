import { MeteorProfile, Volunteers } from '../both/init'

Meteor.publish(`${Volunteers.eventName}.allUsers`, () => {
  // XXX there should be a way to publish only those
  // users that signed up for this event, but not others.
  // XXX this subscription is going to die with 3K users XXX
  if (Volunteers.isManager) {
    return [
      Meteor.users.find(),
      MeteorProfile.ProfilePictures.find().cursor,
    ]
  } else if (Volunteers.isManagerOrLead(this.userId)) {
    return [
      Meteor.users.find({/* TODO this field doesn't seem to be set correctly -- terms: true */}, {
        fields: {
          emails: 1,
          profile: 1,
          terms: 1,
        },
      }),
      MeteorProfile.ProfilePictures.find().cursor,
    ]
  }
  return []
})

Meteor.publish('meteor-user-profiles.ProfilePictures', function publishProfilePictures(userId) {
  if (!userId) { userId = this.userId }
  if (this.userId === userId || Volunteers.isManagerOrLead(this.userId)) {
    return MeteorProfile.ProfilePictures.find({ userId: this.userId }).cursor
  }
  return []
})
