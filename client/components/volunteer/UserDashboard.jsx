import 'bootstrap'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.css'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { BookedTable } from 'meteor/goingnowhere:volunteers'
import { Link } from 'react-router-dom'
import { Volunteers } from '../../../both/init'
import { UserResponsibilities } from './UserResponsibilities.jsx'
import { FilteredSignupList } from '../lead/FilteredSignupList.jsx'
import { T } from '../common/i18n'
import { displayName } from '../common/utils'

export function UserDashboard() {
  const { user, bookedMissions, ready } = useTracker(() => {
    const me = Meteor.user()
    const signupsSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.Signups.byUser`, me._id)
    const teamSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`)

    const signupsSel = { status: { $in: ['confirmed', 'pending'] }, type: { $ne: 'lead' } }
    return {
      user: me,
      bookedMissions:
        Volunteers.collections.signups.find(signupsSel).count() > 0,
      ready: teamSub.ready() && signupsSub.ready(),
    }
  }, [])

  return ready && (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-sm-12 col-md-2 pr-1 bg-grey">
          {user.profile.picture ? (
            <>
              <h3><T>welcome</T> {displayName(user.profile)}</h3>
              <img src="{{imageFileLink user.profile.picture}}" className="rounded-circle header-avatar" alt="" />
            </>
          ) : (
            <>
              <h3><T>welcome</T> {displayName(user.profile)}</h3>
              <img src="img/mr_nobody.jpg" className="rounded-circle header-avatar" alt="" />
              <Link to="/profile/settings"><T>add_picture</T></Link>
            </>
          )}
          <h5 className="mb-2 dark-text"><T>responsibilities</T> </h5>
          <UserResponsibilities />
          <br />
          <Link to="/profile" className="btn btn-light btn-sm">
            <T>edit_user_info</T>
          </Link>
        </div>
        {bookedMissions ? (
          <>
            <div className="col-sm-12 col-md-5 px-1">
              <h2 className="header"><T>booked_missions</T></h2>
              <div>
                <BookedTable />
              </div>
            </div>
            <div className="col-sm-12 col-md-5 px-1">
              <h2 className="header"><T>shift_need_help</T></h2>
              <FilteredSignupList />
            </div>
          </>
        ) : (
          <div className="col-sm-12 col-md-10 px-1">
            <FilteredSignupList />
          </div>
        )}
      </div>
    </div>
  )
}
