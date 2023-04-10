import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { SignupsListTeam } from 'meteor/goingnowhere:volunteers'

import { Volunteers } from '../../../both/init'
import { T, t } from '../common/i18n'

// TODO Make this more useful e.g. at least adding personal signups
export const PublicDeptView = () => {
  const { deptId } = useParams()
  const { dept, teams, ready } = useTracker(() => {
    const deptSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.department`, { _id: deptId })
    const subs = [
      deptSub,
      // Meteor.subscribe(`${Volunteers.eventName}.Signups.byDept`, teamId, 'shift'),
      // Meteor.subscribe(`${Volunteers.eventName}.Signups.byDept`, teamId, 'project'),
      // Meteor.subscribe(`${Volunteers.eventName}.Signups.byDept`, teamId, 'lead'),
    ]

    let foundDept = {}
    let foundTeams = []
    if (deptSub.ready()) {
      foundDept = Volunteers.collections.department.findOne(deptId)
      foundTeams = Volunteers.collections.team.find({ parentId: deptId }).fetch()
    }

    return { dept: foundDept, teams: foundTeams, ready: subs.every(sub => sub.ready()) }
  }, [deptId])

  return (
    <div className="container">
      <div className="row">
        <div className="card">
          <div className="card-header">
            <h5>{dept.name}</h5>
            {dept.email && (
              <h5 className="text-muted text-right"><T>contact</T>: {dept.email}</h5>
            )}
            <div>
              <button
                type="button"
                className="nav-link dropdown-toggle btn btn-light"
                title={t('public_link')}
                data-toggle="dropdown"
              >
                <T>teams</T>
              </button>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
                {teams.map(team => (
                  <Link
                    key={team._id}
                    to={`/department/${deptId}/team/${team._id}`}
                    className="dropdown-item"
                  >
                    {team.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="m-2">{dept.description}</p>
        </div>
      </div>
      <h3 className="pt-2"><T>teams_in_this_department</T></h3>
      {ready && [dept, ...teams].map(team => (
        <SignupsListTeam key={team._id} team={team} />
      ))}
    </div>
  )
}
