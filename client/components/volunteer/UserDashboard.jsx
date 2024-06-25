import 'bootstrap'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.css'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import {
  BookedTable,
  displayName,
  FilteredSignupList,
} from 'meteor/goingnowhere:volunteers'
import { Link, useLocation } from 'react-router-dom'
import { Volunteers } from '../../../both/init'
import { UserResponsibilities } from './UserResponsibilities.jsx'
import { T } from '../common/i18n'
import { ProfilePicture } from '../common/ProfilePicture.jsx'

export function UserDashboard({ user }) {
  // Get type of shifts to show from search or use default
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  // TODO sync changes
  const initialShiftType = searchParams.get('type') || 'all'

  const { bookedMissions, ready } = useTracker(() => {
    const signupsSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.Signups.byUser`, user._id)
    const teamSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`)

    const signupsSel = { status: { $in: ['confirmed', 'pending'] }, type: { $ne: 'lead' } }
    return {
      bookedMissions: Volunteers.collections.signups.find(signupsSel).count() > 0,
      ready: teamSub.ready() && signupsSub.ready(),
    }
  }, [])

  return ready && (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-sm-12 col-md-2 bg-grey dashboard-side-panel">
          <h3><T>welcome</T> {displayName(user)}</h3>
          <ProfilePicture user={user} width="100%" height="" />
          {!user.profile.picture && (
            <Link to="/profile"><T>add_picture</T></Link>
          )}
          <UserResponsibilities />
          <Link to="/profile" className="btn btn-light btn-sm">
            <T>edit_user_info</T>
          </Link>
        </div>
        {bookedMissions && (
          <div className="col-sm-12 col-md-5 px-1">
            <h2 className="header"><T>booked_missions</T></h2>
            <div>
              <BookedTable />
            </div>
          </div>
        )}
        <div className={`col-sm-12 px-1 ${bookedMissions ? 'col-md-5' : 'col-md-10'}`}>
          <h2 className="header"><T>shift_need_help</T></h2>
          <FilteredSignupList initialShiftType={initialShiftType} />
        </div>
      </div>
    </div>
  )
}
