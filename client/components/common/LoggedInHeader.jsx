/* eslint-disable jsx-a11y/anchor-is-valid */
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { Roles } from 'meteor/alanning:roles'
import React from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { T } from './i18n'
import { Volunteers } from '../../../both/init'

export function LoggedInHeader({ user }) {
  const { _id: userId, profile = {} } = user
  const name = profile.nickname || profile.firstName || 'Nobody'

  const history = useHistory()
  const logout = () => {
    Meteor.logout()
    history.push('/')
  }

  const {
    roles,
    allDepartments = [],
    userDepartments = [],
    userTeams = [],
  } = useTracker(() => {
  // FIXME Leads to a bug where private teams are not shown in the team list.
  // We should just replace all this subscription mess across components with a single
  // method call for basic info which is passed around
    Meteor.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
    Meteor.subscribe(`${Volunteers.eventName}.Volunteers.Signups.byUser`, userId, ['lead'])
    const isManager = Volunteers.auth.isManager()
    const userTeamSearch = isManager ? {} : {
      _id: {
        $in: Roles.getRolesForUser(userId, Volunteers.eventName),
      },
    }
    const departments = Volunteers.collections.department.find().fetch()

    return {
      allDepartments: departments,
      userDepartments:
        Volunteers.collections.department.find(userTeamSearch, { sort: { name: 1 } }).fetch(),
      userTeams: Volunteers.collections.team.find(userTeamSearch, { sort: { name: 1 } }).fetch(),
      roles: {
        isManager,
        isLead: Volunteers.auth.isALead(),
        isManagerOrMetaLead: departments.some((d) => Volunteers.auth.isLead(userId, d._id)),
        isNoInfo: Volunteers.services.auth.isNoInfo(),
      },
    }
  }, [user])

  return (
    <nav className="navbar navbar-expand-md bg-primary sticky-top text-uppercase px-1" id="userNav">
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <NavLink className="navbar-brand" to="/dashboard">
        <img src="/img/compass.svg" width="48" height="48" alt="" />
      </NavLink>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavLink to="/dashboard" className="nav-link btn"><T>my_dashboard</T></NavLink>
          </li>
          <li className="nav-item">
            <a
              className="nav-link dropdown-toggle btn"
              href="#"
              id="navbarDropdown3"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <T>explore</T>
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
              {allDepartments.map((dept) => (
                <NavLink key={dept._id} to={`/department/${dept._id}`} className="dropdown-item">
                  {dept.name}
                </NavLink>
              ))}
            </div>
          </li>
          {roles.isManager && (
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle btn"
                href="#"
                id="navbarDropdown1"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <T>manager</T>
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown1">
                <NavLink to="/manager" exact className="dropdown-item"><T>dashboard</T></NavLink>
                <NavLink to="/manager/eventSettings" className="dropdown-item"><T>event_settings</T></NavLink>
                <NavLink to="/manager/emailForms" className="dropdown-item"><T>email_templates</T></NavLink>
                <NavLink to="/manager/userList" className="dropdown-item"><T>all_users</T></NavLink>
              </div>
            </li>
          )}
          {roles.isNoInfo && (
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle btn"
                href="#"
                id="navbarDropdown2"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <T>noinfo</T>
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown2">
                <NavLink to="/noinfo" exact className="dropdown-item"><T>dashboard</T></NavLink>
                <NavLink to="/noinfo/userList" className="dropdown-item"><T>all_users</T></NavLink>
              </div>
            </li>
          )}
          {roles.isManagerOrMetaLead && (
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle btn"
                href="#"
                id="navbarDropdown3"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <T>metalead</T>
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
                {userDepartments.map((dept) => (
                  <NavLink key={dept._id} to={`/metalead/department/${dept._id}`} className="dropdown-item">{dept.name}</NavLink>
                ))}
              </div>
            </li>
          )}
          {roles.isLead && (
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle btn"
                href="#"
                id="navbarDropdown4"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <T>lead</T>
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
                {userTeams.map((team) => (
                  <NavLink key={team._id} to={`/lead/team/${team._id}`} className="dropdown-item">{team.name}</NavLink>
                ))}
              </div>
            </li>
          )}
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle btn"
              href="#"
              id="navbarDropdown5"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <T>welcome</T> {name}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
              <NavLink to="/profile" exact className="dropdown-item"><T>user_details</T></NavLink>
              <NavLink to="/password" className="dropdown-item"><T>change_password</T></NavLink>
              {roles.isImpersonating
                && <a className="dropdown-item" data-action="unimpersonate"><T>impersonate</T></a>}
              <a className="dropdown-item" role="button" href="#" onClick={logout}><T>logout</T></a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}
