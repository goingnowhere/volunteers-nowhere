import { Meteor } from 'meteor/meteor'
import React from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import { MeteorProfile } from '../../../both/init'

const ProfilePictureComponent = ({ src }) => (
  <img src={src} alt="" className="rounded-circle header-avatar img-fluid" />
)

export const ProfilePicture = withTracker(({ userId, id }) => {
  let src = '/img/mr_nobody.jpg'
  if (id) {
    Meteor.subscribe('meteor-user-profiles.ProfilePictures', userId)
    const pic = MeteorProfile.ProfilePictures.findOne(id)
    if (pic) {
      src = pic.link()
    }
  }
  return { src }
})(ProfilePictureComponent)
