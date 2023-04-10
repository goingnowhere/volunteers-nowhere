import React from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
} from 'react-router-dom'
import { setRouterHistory } from 'meteor/piemonkey:accounts-ui'

import Blaze from 'meteor/gadicc:blaze-react-component'
import { RequireAuth } from './components/RequireAuth.jsx'
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
import { VerifyEmail } from './components/VerifyEmail.jsx'
import { NoInfoDashboard } from './components/noinfo/NoInfoDashboard.jsx'
import { NoInfoUserList } from './components/noinfo/NoInfoUserList.jsx'
import { LeadDashboard } from './components/lead/LeadDashboard.jsx'
import { DeptDashboard } from './components/lead/DeptDashboard.jsx'
import { UserDashboard } from './components/volunteer/UserDashboard.jsx'
import { PublicTeamView } from './components/public/PublicTeamView.jsx'
import { PublicDeptView } from './components/public/PublicDeptView.jsx'
import { Magic } from './components/accounts/Magic.jsx'

// Maybe there's a better way to do this but we also want to remove accounts-ui
function AccountsRedirector() {
  const history = useHistory()
  // Allows accounts-ui to redirect based on hashes such as for password resets
  setRouterHistory(history)
  return null
}

export function Routes(eventInfo) {
  const { user, settings, isLoaded } = eventInfo
  return (
    <BrowserRouter>
      <AccountsRedirector />
      <Header user={user} />
      <Switch>
        <Route exact path="/"><HomePage {...eventInfo} /></Route>
        <Route path="/login"><Login /></Route>
        <Route path="/signup"><Signup /></Route>
        <Route path="/password-reset"><Reset /></Route>
        <Route path="/verify-email"><VerifyEmail /></Route>
        <Route path="/magic"><Magic user={user} /></Route>
        <Route path="/password">
          <RequireAuth {...eventInfo}><Password /></RequireAuth>
        </Route>
        <Route path="/profile">
          <RequireAuth {...eventInfo}><VolunteerForm /></RequireAuth>
        </Route>
        <Route path="/dashboard">
          <RequireAuth {...eventInfo}><UserDashboard user={user} /></RequireAuth>
        </Route>
        {/* TODO Make a publically visible version of these */}
        <Route path="/department/:deptId/team/:teamId/">
          <RequireAuth {...eventInfo}><PublicTeamView /></RequireAuth>
        </Route>
        <Route path="/department/:deptId">
          <RequireAuth {...eventInfo}><PublicDeptView /></RequireAuth>
        </Route>
        <Route path="/lead/team/:teamId">
          <RequireAuth {...eventInfo} authTest="isLead" leadIdParam="teamId"><LeadDashboard /></RequireAuth>
        </Route>
        <Route path="/metalead/department/:deptId">
          <RequireAuth {...eventInfo} authTest="isLead" leadIdParam="deptId"><DeptDashboard /></RequireAuth>
        </Route>
        <Route path="/manager/eventSettings">
          <RequireAuth {...eventInfo} authTest="isManager">
            <EventSettingsScreen settings={settings} isLoaded={isLoaded} />
          </RequireAuth>
        </Route>
        <Route path="/manager/emailForms">
          <RequireAuth {...eventInfo} authTest="isManager"><Blaze template="managerEmailForms" /></RequireAuth>
        </Route>
        <Route path="/manager/emailApproval">
          <RequireAuth {...eventInfo} authTest="isManager"><EmailApproval /></RequireAuth>
        </Route>
        <Route path="/manager/userList">
          <RequireAuth {...eventInfo} authTest="isManager"><ManagerUserList /></RequireAuth>
        </Route>
        <Route path="/manager">
          <RequireAuth {...eventInfo} authTest="isManager"><ManagerDashboard /></RequireAuth>
        </Route>
        {/* FIXME needs to check for NoInfo lead */}
        <Route path="/noinfo/userList">
          <RequireAuth {...eventInfo} authTest="isALead"><NoInfoUserList /></RequireAuth>
        </Route>
        <Route path="/noinfo">
          <RequireAuth {...eventInfo} auth="isALead"><NoInfoDashboard /></RequireAuth>
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}
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
