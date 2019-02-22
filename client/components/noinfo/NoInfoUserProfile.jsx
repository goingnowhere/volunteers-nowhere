import { Meteor } from 'meteor/meteor'
import React from 'react'
import Fa from 'react-fontawesome'
import { withTracker } from 'meteor/react-meteor-data'
import { displayName } from 'meteor/abate:meteor-user-profiles'
import { Volunteers, MeteorProfile } from '../../../both/init'
import { T } from '../common/i18n'
import { UserResponsibilities } from '../volunteer/UserResponsibilities.jsx'
import { VolunteerFormDisplay } from './VolunteerFormDisplay.jsx'

const { BookedTable } = Volunteers.components
const NoInfoUserProfileComponent = ({ user, profilePic, volForm }) => (
  <div className="container-fluid">
    {user && (
      <div className="row">
        <div className="col">
          <div className="raw">
            <div className="col-md-3 col-lg-3 " align="center">
              {user.profile.picture
                ? <img src={profilePic} className="rounded-circle header-avatar img-fluid" alt="Profile" />
                : <img src="/img/mr_nobody.jpg" className="rounded-circle header-avatar" alt="Profile" />}
            </div>
          </div>
          <div className="row">
            <table className="table table-user-information">
              <tbody>
                <tr>
                  <td><T>name</T></td>
                  <td>{displayName(user)}
                    {user.status.online && <span className="text-success"> <Fa name="circle" /></span>}
                  </td>
                </tr>
                <tr>
                  <td><T>real_name</T></td>
                  <td>{user.profile.firstName} {user.profile.lastName}</td>
                </tr>
                <tr><td><T>ticket_number</T></td><td>{user.ticketId}</td></tr>
                <tr><td><T>email</T> </td>
                  <td>
                    {user.emails[0].address}
                    {user.emails[0].verified
                      ? <span className="text-success"><Fa name="check" /></span>
                      : <span className="text-danger"><Fa name="warning" /></span>}
                  </td>
                </tr>
              </tbody>
            </table>
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
  const picture = user && user.profile.picture
    && MeteorProfile.ProfilePictures.findOne(user.profile.picture)

  return {
    user,
    profilePic: picture && picture.link(),
    volForm: Volunteers.Collections.VolunteerForm.findOne({ userId }),
  }
})(NoInfoUserProfileComponent)
