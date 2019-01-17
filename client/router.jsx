/* eslint-disable react/jsx-max-props-per-line, react/no-multi-comp */
import React, { Fragment, memo } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { Header } from './components/common/Header.jsx'
import { NotFound } from './components/common/NotFound.jsx'
import {
  Login,
  Signup,
  Reset,
  Password,
} from './components/accounts/accountsUI/pages.jsx'

// TODO Add redirect to profile
// hasAgreedTOS() {
//   const user = Meteor.user()
//   const f = Volunteers.Collections.VolunteerForm.findOne({ userId: user._id })
//   const t = user.profile.terms
//   return (t && f)
// },
const LoggedInRoute = ({ component: Component, ...routeProps }) => (
  <Route
    {...routeProps} component={withTracker(
      navProps => ({ loggedIn: !!Meteor.userId(), navProps }),
    )(
      ({ loggedIn, navProps }) => (loggedIn ? (
        <Component {...navProps} />
      ) : (
        <Redirect to={{ pathname: '/login', state: { from: navProps.location } }} />
      )),
    )}
  />
)

const Dashboard = () => <Blaze template="userDashboard" />
export const Routes = () => (
  <BrowserRouter>
    <Fragment>
      <Header />
      <Switch>
        <Route exact path="/" render={() => <Blaze template="homePage" />} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/password-reset" component={Reset} />
        <Route path="/volunteers-agreement" render={() => <Blaze template="organization" />} />
        <Route path="/organization" render={() => <Blaze template="organization" />} />
        <LoggedInRoute path="/password" component={Password} />
        <LoggedInRoute path="/profile/settings" component={memo(() => <Blaze template="accountSettings" />)} />
        <LoggedInRoute path="/profile" component={memo(() => <Blaze template="volunteerForm" />)} />
        <LoggedInRoute path="/dashboard" component={Dashboard} />
        <LoggedInRoute path="/department/:_id/team/:_teamId/:_period?" component={memo(({ match }) => <Blaze template="publicTeamView" {...match.params} />)} />
        <LoggedInRoute path="/department/:id" component={memo(({ match }) => <Blaze template="publicDepartmentView" _id={match.params.id} />)} />
        {/* FIXME needs to check for lead */}
        <LoggedInRoute path="/lead/team/:id" component={memo(({ match }) => <Blaze template="leadTeamView" _id={match.params.id} />)} />
        {/* FIXME needs to check for metalead */}
        <LoggedInRoute path="/metalead/department/:id" component={memo(({ match }) => <Blaze template="metaleadDepartmentView" _id={match.params.id} />)} />
        {/* FIXME needs to check for manager */}
        <LoggedInRoute path="/manager/userform" component={memo(() => <Blaze template="managerUserForm" />)} />
        <LoggedInRoute path="/manager/eventSettings" component={memo(() => <Blaze template="managerEventSettings" />)} />
        <LoggedInRoute path="/manager/emailForms" component={memo(() => <Blaze template="managerEmailForms" />)} />
        <LoggedInRoute path="/manager/userList" component={memo(() => <Blaze template="managerUserList" page="ManagerUserPages" />)} />
        <LoggedInRoute path="/manager" component={memo(() => <Blaze template="managerView" />)} />
        {/* FIXME needs to check for NoInfo lead */}
        <LoggedInRoute path="/noinfo/newuser" component={memo(() => <Blaze template="noInfoNewUser" />)} />
        <LoggedInRoute path="/noinfo/userList" component={memo(() => <Blaze template="noInfoUserList" page="NoInfoUserPages" />)} />
        <LoggedInRoute path="/noinfo/user/:_id" component={memo(({ match }) => <Blaze template="noInfoUserProfile" userId={match._id} />)} />
        <LoggedInRoute path="/noinfo" component={memo(() => <Blaze template="noInfoDashboard" />)} />
        <Route component={NotFound} />
      </Switch>
    </Fragment>
  </BrowserRouter>
)

// TODO Implement as a sub-route under /lead/team/:id
// Router.route('/lead/team/:_id/rota', {
//   name: 'leadTeamRota',
//   template: 'teamShiftsRota',
//   controller: LeadController,
//   waitOn() {
//     if (this.params && this.params._id) {
//       const sel = { _id: this.params._id }
//       return [
//         Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, sel),
//       ]
//     }
//     return null
//   },
//   data() {
//     if (this.params && this.params._id && this.ready()) {
//       return Volunteers.Collections.Team.findOne(this.params._id)
//     }
//     return null
//   },
// })
