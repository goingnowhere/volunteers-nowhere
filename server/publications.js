import { MeteorProfile, Volunteers } from '../both/init';

Meteor.publish(`${Volunteers.eventName}.allUsers`, function () {
  // XXX there should be a way to publish only those
  // users that signed up for this event, but not others.
  // XXX this subscription is going to die with 3K users XXX
  if (Volunteers.isManager) {
    return [
      Meteor.users.find(),
      MeteorProfile.ProfilePictures.find().cursor
    ];
  } else {
    return [];
  }
});

Meteor.publish('meteor-user-profiles.ProfilePictures', function (userId) {
  if (! userId) { userId = this.userId; }
  if (this.userId == userId || Volunteers.isManagerOrLead(this.userId)) {
    return MeteorProfile.ProfilePictures.find({userId: this.userId}).cursor;
  }
});
