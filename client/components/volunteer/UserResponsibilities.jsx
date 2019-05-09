import React from 'react'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
// import { Link } from 'react-router-dom'
import { Volunteers } from '../../../both/init'
import { T } from '../common/i18n'
import { Link } from '../common/BlazeLink.jsx'

export const UserResponsibilitiesComponent = ({
  isManager,
  isNoInfo,
  leads,
  metaleads,
}) => (
  <ul className="list-unstyled">
    {isManager && <li><span className="mb-2 dark-text"><T>role</T>: </span>Manager</li>}
    {isNoInfo && <li><span className="mb-2 dark-text"><T>noInfo</T>: </span>Member</li>}
    {leads.map(team => (
      <li key={team._id}>
        <span className="mb-2 dark-text"><T>lead</T>: </span>
        <Link to={`/lead/team/${team._id}`}>{team.name}</Link>
      </li>
    ))}
    {metaleads.map(dept => (
      <li key={dept._id}>
        <span className="mb-2 dark-text"><T>metalead</T>: </span>
        <Link to={`/metalead/department/${dept._id}`}>{dept.name}</Link>
      </li>
    ))}
  </ul>
)

export const UserResponsibilities = withTracker(({ userId: userIdIn }) => {
  const userId = userIdIn || Meteor.userId()
  const isManager = Volunteers.isManager(userId)
  const leadSignupTeamIds = Volunteers.Collections.LeadSignups.find({ userId, status: 'confirmed' })
    .map(signup => signup.parentId)
  return {
    leads: Volunteers.Collections.Team.find({ _id: { $in: leadSignupTeamIds } }).fetch(),
    metaleads: Volunteers.Collections.Department.find({ _id: { $in: leadSignupTeamIds } }).fetch(),
    isManager,
    isNoInfo: isManager
      || !!Volunteers.Collections.Team.findOne({ name: 'NoInfo', _id: { $in: leadSignupTeamIds } }),
  }
})(UserResponsibilitiesComponent)
