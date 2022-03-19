/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Route, Redirect } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import moment from 'moment-timezone'
import { EventSettings } from '../../both/collections/settings'
import { Volunteers } from '../../both/init'

const LoggedInRouteComponent = ({
  user,
  Component,
  navProps,
  openDate,
}) => {
  // Meteor seems to set user as 'null' when not logged in and 'undefined' when loading
  if (typeof user === 'undefined') return null
  if (user) {
    if (!user.emails.some((email) => email.verified)) return <Redirect to="/verify-email" />
    if (moment().isBefore(openDate) && !Volunteers.auth.isALead()) {
      // FIST is closed for now
      return <Redirect to="/" />
    }
    if (user.profile.formFilled || navProps.match.path === '/profile') return <Component {...navProps} />
    return <Redirect to={{ pathname: '/profile', state: { from: navProps.location } }} />
  }
  return <Redirect to={{ pathname: '/login', state: { from: navProps.location } }} />
}

export const LoggedInRoute = ({ component: Component, ...routeProps }) => (
  <Route
    {...routeProps}
    component={withTracker(
      (navProps) => {
        const settingsSub = Meteor.subscribe('eventSettings')
        if (!settingsSub.ready()) return null
        const settings = EventSettings.findOne() || {}
        return ({
          user: Meteor.user(),
          Component,
          navProps,
          openDate: settings.fistOpenDate,
        })
      },
    )(LoggedInRouteComponent)}
  />
)
