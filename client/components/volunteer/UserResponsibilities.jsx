import React from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { Link } from 'react-router-dom'
import { Volunteers } from '../../../both/init'
import { T } from '../common/i18n'

const { collections, services } = Volunteers

export function UserResponsibilities({ userId: userIdIn }) {
  const {
    isManager,
    leads,
    metaleads,
    isNoInfo,
  } = useTracker(() => {
    const userId = userIdIn || Meteor.userId()
    const hasManagerRole = services.auth.isManager(userId)
    const leadSignupTeamIds = services.auth.getLeadUnitIds(userId)
    if (leadSignupTeamIds) {
      const metaleadDepts = collections.department.find({ _id: { $in: leadSignupTeamIds } }).fetch()
      const metaleadDeptIds = metaleadDepts.map((dept) => dept._id)
      const leadTeams = collections.team.find({
        _id: { $in: leadSignupTeamIds },
        parentId: { $not: { $in: metaleadDeptIds } },
      }).fetch()
      return {
        leads: leadTeams,
        metaleads: metaleadDepts,
        isManager: hasManagerRole,
        isNoInfo: hasManagerRole
          || !!collections.team.findOne({ name: 'NoInfo', _id: { $in: leadSignupTeamIds } }),
      }
    }
    return {
      leads: [],
      metaleads: [],
      isManager: hasManagerRole,
      isNoInfo: hasManagerRole,
    }
  }, [userIdIn])

  const hasResponsibility = isManager || isNoInfo || leads.length > 0 || metaleads.length > 0

  return hasResponsibility && (
    <>
      <h5 className="dark-text"><T>responsibilities</T> </h5>
      <ul className="list-unstyled">
        {isManager && <li><span className="mb-2 dark-text"><T>role</T>: </span>Manager</li>}
        {isNoInfo && <li><span className="mb-2 dark-text"><T>noInfo</T>: </span>Member</li>}
        {leads.map((team) => (
          <li key={team._id}>
            <span className="mb-2 dark-text"><T>lead</T>: </span>
            <Link to={`/lead/team/${team._id}`}>{team.name}</Link>
          </li>
        ))}
        {metaleads.map((dept) => (
          <li key={dept._id}>
            <span className="mb-2 dark-text"><T>metalead</T>: </span>
            <Link to={`/metalead/department/${dept._id}`}>{dept.name}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}
