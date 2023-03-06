import { Meteor } from 'meteor/meteor'
import React from 'react'
import Fa from 'react-fontawesome'
import { withTracker } from 'meteor/react-meteor-data'
import { displayName, BookedTable } from 'meteor/goingnowhere:volunteers'
import { Volunteers, MeteorProfile } from '../../../both/init'
import { T } from '../common/i18n'
import { UserResponsibilities } from '../volunteer/UserResponsibilities.jsx'
import { UserInfoList } from '../lead/UserInfoList.jsx'
import { VolunteerFormDisplay } from './VolunteerFormDisplay.jsx'

const NoInfoUserProfileComponent = ({ user, profilePic, volForm }) => (
  <div className="container-fluid">
    {user && user.profile && (
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col-md-3">
              {user.profile.picture
                ? <img src={profilePic} className="rounded-circle header-avatar img-fluid" alt="Profile" />
                : <img src="/img/mr_nobody.jpg" className="rounded-circle header-avatar" alt="Profile" />}
            </div>
          </div>
          <div className="row">
            <UserInfoList user={user} />
          </div>
          <VolunteerFormDisplay form={volForm} />
        </div>
        <div className="col">
          <h5 className="mb-2 dark-text"><T>responsibilities</T> </h5>
          <div><UserResponsibilities userId={user._id} /></div>
          <h2 className="header"><T>shifts</T></h2>
          <div>
            <BookedTable userId={user._id} />
          </div>
        </div>
      </div>
    )}
  </div>
)

export const NoInfoUserProfile = withTracker(({ userId }) => {
  Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  Meteor.subscribe('meteor-user-profiles.ProfilePictures', userId)
  Meteor.subscribe('user.extra', userId)
  const user = Meteor.users.findOne(userId)
  const picture = user && user.profile && user.profile.picture
    && MeteorProfile.ProfilePictures.findOne(user.profile.picture)

  return {
    user,
    profilePic: picture && picture.link(),
    volForm: Volunteers.collections.volunteerForm.findOne({ userId }),
  }
})(NoInfoUserProfileComponent)
