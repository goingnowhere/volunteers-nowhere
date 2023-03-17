import { Meteor } from 'meteor/meteor'
import React from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import { BookedTable, UserInfoList } from 'meteor/goingnowhere:volunteers'
import { Volunteers } from '../../../both/init'
import { T } from '../common/i18n'
import { UserResponsibilities } from '../volunteer/UserResponsibilities.jsx'
import { VolunteerFormDisplay } from './VolunteerFormDisplay.jsx'
import { ProfilePicture } from '../common/ProfilePicture.jsx'

const NoInfoUserProfileComponent = ({ user, volForm }) => (
  <div className="container-fluid">
    {user && user.profile && (
      <div className="row">
        <div className="col">
          <div className="row mb-2">
            <ProfilePicture user={user} width={192} height={192} />
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
  Meteor.subscribe('user.extra', userId)
  const user = Meteor.users.findOne(userId)

  return {
    user,
    volForm: Volunteers.collections.volunteerForm.findOne({ userId }),
  }
})(NoInfoUserProfileComponent)
