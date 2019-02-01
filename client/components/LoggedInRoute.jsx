import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'

const LoggedInRouteComponent = ({ user, Component, navProps }) => {
  // Meteor seems to set user as 'null' when not logged in and 'undefined' when loading
  if (typeof user === 'undefined') return null
  if (user) {
    if (user.profile.formFilled || navProps.match.path === '/profile') return <Component {...navProps} />
    if (!user.emails.some(email => email.verified)) return <Redirect to="/verify-email" />
    return <Redirect to={{ pathname: '/profile', state: { from: navProps.location } }} />
  }
  return <Redirect to={{ pathname: '/login', state: { from: navProps.location } }} />
}

export const LoggedInRoute = ({ component: Component, ...routeProps }) => (
  <Route
    {...routeProps}
    component={withTracker(
      navProps => ({ user: Meteor.user(), Component, navProps }),
    )(LoggedInRouteComponent)}
  />
)
