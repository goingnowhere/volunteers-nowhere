import React from 'react'
import { Loading } from 'meteor/goingnowhere:volunteers'
import { Redirect, useLocation, useParams } from 'react-router-dom'
import moment from 'moment-timezone'
import { Volunteers } from '../../both/init'
import { NotFound } from './common/NotFound.jsx'

export function RequireAuth({
  user,
  settings,
  isLoaded,
  authTest,
  leadIdParam,
  children,
}) {
  const params = useParams()
  const location = useLocation()

  // Meteor seems to set user as 'null' when not logged in and 'undefined' when loading
  if (typeof user === 'undefined' || !isLoaded) {
    return <Loading />
  }
  if (!user) {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />
  }
  const verifiedEmails = user.emails.filter(email => email.verified)
  if (verifiedEmails.length === 0) {
    return <Redirect to="/verify-email" />
  }
  if (moment().isBefore(settings.fistOpenDate)
    && !verifiedEmails.some(({ address }) => address.endsWith('@goingnowhere.org'))
    && !Volunteers.auth.isALead()) {
    // FIST is closed for now
    return <Redirect to="/" />
  }
  if (authTest) {
    let testRes = false
    if (!Volunteers.auth[authTest]) {
      console.error('Unable to test auth correctly, so failing', authTest)
    }
    if (leadIdParam) {
      const teamId = params[leadIdParam]
      if (!teamId) {
        console.error('Team Id param not passed correctly', leadIdParam, teamId)
      } else {
        testRes = Volunteers.auth[authTest](undefined, teamId)
      }
    } else {
      testRes = Volunteers.auth[authTest]()
    }
    if (!testRes) {
      return <NotFound />
    }
  }
  if (location.pathname !== '/profile' && !user.profile.formFilled) {
    return <Redirect to={{ pathname: '/profile', state: { from: location } }} />
  }
  return children
}
