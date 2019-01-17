import React from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import { LoggedInHeader } from './LoggedInHeader.jsx'
import { HomeHeader } from './HomeHeader.jsx'

export const Header = withTracker(
  () => ({ loggedIn: !!Meteor.userId() }),
)(
  ({ loggedIn }) => (loggedIn ? (
    <LoggedInHeader />
  ) : (
    <HomeHeader />
  )),
)
