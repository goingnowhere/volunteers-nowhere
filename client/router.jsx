import React, { memo } from 'react'
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
import { EmailApproval } from './components/manager/EmailApproval.jsx'
import { EventSettingsScreen } from './components/manager/EventSettingsScreen.jsx'
import { LoggedInRoute } from './components/LoggedInRoute.jsx'
import { VerifyEmail } from './components/VerifyEmail.jsx'
import { NoInfoDashboard } from './components/noinfo/NoInfoDashboard.jsx'
import { NoInfoUserList } from './components/noinfo/NoInfoUserList.jsx'
import { LeadDashboard } from './components/lead/LeadDashboard.jsx'
import { DeptDashboard } from './components/lead/DeptDashboard.jsx'
import { UserDashboard } from './components/volunteer/UserDashboard.jsx'
import { PublicTeamView } from './components/public/PublicTeamView.jsx'
import { PublicDeptView } from './components/public/PublicDeptView.jsx'

export const Routes = () => (
  <BrowserRouter>
    <>
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/password-reset" component={Reset} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/volunteers-agreement" render={() => <Blaze template="volAgreement" />} />
        <LoggedInRoute path="/password" component={Password} />
        <LoggedInRoute path="/profile" component={VolunteerForm} />
        <LoggedInRoute path="/dashboard" component={UserDashboard} />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <LoggedInRoute path="/department/:deptId/team/:teamId/" component={PublicTeamView} />
        <LoggedInRoute path="/department/:deptId" component={PublicDeptView} />
        {/* FIXME needs to check for lead */}
        <LoggedInRoute path="/lead/team/:teamId" component={LeadDashboard} />
        {/* FIXME needs to check for metalead */}
        <LoggedInRoute path="/metalead/department/:deptId" component={DeptDashboard} />
        {/* FIXME needs to check for manager */}
        <LoggedInRoute path="/manager/eventSettings" component={EventSettingsScreen} />
        <LoggedInRoute path="/manager/emailForms" component={memo(() => <Blaze template="managerEmailForms" />)} />
        <LoggedInRoute path="/manager/emailApproval" component={EmailApproval} />
        <LoggedInRoute path="/manager/userList" component={ManagerUserList} />
        <LoggedInRoute path="/manager" component={ManagerDashboard} />
        {/* FIXME needs to check for NoInfo lead */}
        <LoggedInRoute path="/noinfo/userList" component={NoInfoUserList} />
        <LoggedInRoute path="/noinfo" component={NoInfoDashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
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
//       return Volunteers.collections.team.findOne(this.params._id)
//     }
//     return null
//   },
// })
