/* eslint-disable react/no-multi-comp */
import React, { Fragment, memo } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { HomePage } from './components/HomePage.jsx'
import { Header } from './components/common/Header.jsx'
import { NotFound } from './components/common/NotFound.jsx'
import {
  Login,
  Signup,
  Reset,
  Password,
} from './components/accounts/accountsUI/pages.jsx'
import { VolunteerForm } from './components/volunteer/VolunteerForm.jsx'
import { ManagerDashboard } from './components/manager/ManagerDashboard.jsx'
import { ManagerUserList } from './components/manager/ManagerUserList.jsx'
import { LoggedInRoute } from './components/LoggedInRoute.jsx'
import { VerifyEmail } from './components/VerifyEmail.jsx'
import { NoInfoDashboard } from './components/noinfo/NoInfoDashboard.jsx'
import { NoInfoUserList } from './components/noinfo/NoInfoUserList.jsx'

const Dashboard = () => <Blaze template="userDashboard" />
export const Routes = () => (
  <BrowserRouter>
    <Fragment>
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/password-reset" component={Reset} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/volunteers-agreement" render={() => <Blaze template="volAgreement" />} />
        <LoggedInRoute path="/password" component={Password} />
        <LoggedInRoute path="/profile/settings" component={memo(() => <Blaze template="accountSettings" />)} />
        <LoggedInRoute path="/profile" component={VolunteerForm} />
        <LoggedInRoute path="/dashboard" component={Dashboard} />
        <LoggedInRoute path="/department/:_id/team/:_teamId/:_period?" component={memo(({ match }) => <Blaze template="publicTeamView" {...match.params} />)} />
        <LoggedInRoute path="/department/:id" component={memo(({ match }) => <Blaze template="publicDepartmentView" _id={match.params.id} />)} />
        {/* FIXME needs to check for lead */}
        <LoggedInRoute path="/lead/team/:id" component={memo(({ match }) => <Blaze template="leadTeamView" _id={match.params.id} />)} />
        {/* FIXME needs to check for metalead */}
        <LoggedInRoute path="/metalead/department/:id" component={memo(({ match }) => <Blaze template="metaleadDepartmentView" _id={match.params.id} />)} />
        {/* FIXME needs to check for manager */}
        <LoggedInRoute path="/manager/eventSettings" component={memo(() => <Blaze template="managerEventSettings" />)} />
        <LoggedInRoute path="/manager/emailForms" component={memo(() => <Blaze template="managerEmailForms" />)} />
        <LoggedInRoute path="/manager/userList" component={ManagerUserList} />
        <LoggedInRoute path="/manager" component={ManagerDashboard} />
        {/* FIXME needs to check for NoInfo lead */}
        <LoggedInRoute path="/noinfo/userList" component={NoInfoUserList} />
        {/* <LoggedInRoute path="/noinfo/user/:_id" component={memo(({ match }) => <Blaze template="noInfoUserProfile" userId={match._id} />)} /> */}
        <LoggedInRoute path="/noinfo" component={NoInfoDashboard} />
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
