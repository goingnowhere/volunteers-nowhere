import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { MeteorProfile, Volunteers } from '../both/init'

/*  managers, leads and the user itself is authorized to see the picture. */
Meteor.publish('meteor-user-profiles.ProfilePictures', function publishProfilePictures(userId = this.userId) {
  if (!this.userId) return null
  check(userId, String)

  if (this.userId === userId // the user asking for its picture
    || Volunteers.auth.isLead()) { // a lead, metalead or admin asking
    return MeteorProfile.ProfilePictures.find({ userId }).cursor
  }
  return null
})

Meteor.publish('user.extra', function publishUserExtra(userId = this.userId) {
  if (!this.userId) return null
  check(userId, String)

  if (this.userId === userId // the user asking for its data
    || Volunteers.auth.isLead()) { // a lead, metalead or admin asking
    return Meteor.users.find({ _id: userId }, {
      fields: {
        emails: true,
        profile: true,
        ticketId: true,
        status: true,
        isBanned: true,
      },
    })
  }
  return null
})
