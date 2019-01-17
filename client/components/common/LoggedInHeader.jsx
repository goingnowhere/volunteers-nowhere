/* eslint-disable jsx-a11y/anchor-is-valid */
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import { Roles } from 'meteor/piemonkey:roles'
import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { __ } from './i18n'
import { Volunteers } from '../../../both/init'

const LoggedInHeaderComponent = ({
  name,
  roles,
  logout,
  allDepartments = [],
  userDepartments = [],
  userTeams = [],
}) => (
  <nav className="navbar navbar-expand-md bg-primary sticky-top text-uppercase" id="userNav">
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
      <img src="/img/compass.svg" className="img-fluid header-avatar" alt="" />
    </NavLink>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <NavLink to="/dashboard" className="nav-link">{__('my_dashboard')}</NavLink>
        </li>
        <li className="nav-item">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="navbarDropdown3"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {__('explore')}
          </a>
          <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
            {allDepartments.map(dept => (
              <NavLink key={dept._id} to={`/department/${dept._id}`} className="dropdown-item">
                {dept.name}
              </NavLink>
            ))}
          </div>
        </li>
        {roles.isManager && (
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown1"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {__('manager')}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown1">
              <NavLink to="/manager" className="dropdown-item">{__('dashboard')}</NavLink>
              <NavLink to="/manager/userform" className="dropdown-item">{__('profile_form')}</NavLink>
              <NavLink to="/manager/eventSettings" className="dropdown-item">{__('event_settings')}</NavLink>
              <NavLink to="/manager/emailForms" className="dropdown-item">{__('email_templates')}</NavLink>
              <NavLink to="/manager/userList" className="dropdown-item">{__('all_users')}</NavLink>
            </div>
          </li>
        )}
        {roles.isNoInfo && (
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown2"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {__('noinfo')}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown2">
              <NavLink to="/noinfo" className="dropdown-item">{__('dashboard')}</NavLink>
              <NavLink to="/noinfo/userList" className="dropdown-item">{__('all_users')}</NavLink>
            </div>
          </li>
        )}
        {roles.isManagerOrMetaLead && (
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown3"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {__('metalead')}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
              {userDepartments.map(dept => (
                <NavLink key={dept._id} to={`/metalead/department/${dept._id}`} className="dropdown-item">{dept.name}</NavLink>
              ))}
            </div>
          </li>
        )}
        {roles.isManagerOrLead && (
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown4"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {__('lead')}
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
              {userTeams.map(team => (
                <NavLink key={team._id} to={`/lead/team/${team._id}`} className="dropdown-item">{team.name}</NavLink>
              ))}
            </div>
          </li>
        )}
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="navbarDropdown5"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {__('welcome')} {name}
          </a>
          <div className="dropdown-menu" aria-labelledby="navbarDropdown3">
            <NavLink to="/profile" className="dropdown-item">{__('volunteer_form')}</NavLink>
            <NavLink to="/password" className="dropdown-item">{__('change_password')}</NavLink>
            <NavLink to="/profile/settings" className="dropdown-item">{__('user_details')}</NavLink>
            {roles.isImpersonating
              && <a className="dropdown-item" data-action="unimpersonate">{__('impersonate')}</a>
            }
            <a className="dropdown-item" role="button" href="#" onClick={logout}>{__('logout')}</a>
          </div>
        </li>
      </ul>
    </div>
  </nav>
)

export const LoggedInHeader = withRouter(withTracker(({ history }) => {
  const { _id: userId, profile = {} } = Meteor.user() || {}
  Meteor.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
  Meteor.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`, userId)
  const isManager = Volunteers.isManager()
  const userTeamSearch = isManager ? {} : {
    _id: {
      $in: Roles.getRolesForUser(userId, Volunteers.eventName),
    },
  }
  const allDepartments = Volunteers.Collections.Department.find().fetch()
  let isNoInfo = isManager
  if (!isManager) {
    // TODO replace with 'coordinator' role
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' }) || {}
    isNoInfo = Volunteers.isManagerOrLead(userId, [noInfo._id])
  }
  return {
    name: profile.nickname || profile.firstName,
    logout: () => {
      Meteor.logout()
      history.push('/')
    },
    allDepartments,
    userDepartments: Volunteers.Collections.Department.find(userTeamSearch).fetch(),
    userTeams: Volunteers.Collections.Team.find(userTeamSearch).fetch(),
    roles: {
      isManager,
      isManagerOrLead: Volunteers.isManager() || Volunteers.isLead(),
      isManagerOrMetaLead: Volunteers.isManagerOrLead(userId, allDepartments.map(d => d._id)),
      isNoInfo,
    },
  }
})(LoggedInHeaderComponent))
