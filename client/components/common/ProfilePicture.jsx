import { Meteor } from 'meteor/meteor'
import React from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { MeteorProfile } from '../../../both/init'

const nobody = '/img/mr_nobody.jpg'

export function ProfilePicture({
  srcOverride,
  user,
  width,
  height,
}) {
  const photoId = user?.profile?.picture
  const src = useTracker(() => {
    if (photoId && !srcOverride) {
      Meteor.subscribe('meteor-user-profiles.ProfilePictures', user._id)
      const pic = MeteorProfile.ProfilePictures.findOne(photoId)
      if (pic) {
        return pic.link()
      }
    }
    return srcOverride || nobody
  })

  return (
    <img
      src={src}
      alt=""
      width={width ?? 48}
      height={height ?? 48}
      className="rounded profile-pic"
    />
  )
}
