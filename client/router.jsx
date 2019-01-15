/* eslint-disable react/jsx-max-props-per-line, react/no-multi-comp, react/button-has-type */
import React, { Fragment, memo } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
  Link,
  Redirect,
} from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { Accounts, STATES } from 'meteor/piemonkey:accounts-ui'
import { Header as LoggedInHeader } from './components/common/Header.jsx'
import { HomeHeader } from './components/common/HomeHeader.jsx'
import { NotFound } from './components/common/NotFound.jsx'

// TODO move out?
const Header = withTracker(
  () => ({ loggedIn: !!Meteor.userId() }),
)(
  ({ loggedIn }) => (loggedIn ? (
    <LoggedInHeader />
  ) : (
    <HomeHeader />
  )),
)

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

// TODO move to separate file
class Field extends Accounts.ui.Field {
  render() {
    const {
      id,
      hint,
      label,
      type = 'text',
      onChange,
      required = false,
      defaultValue = '',
      message,
    } = this.props
    return (
      <div className="form-group">
        <label className="control-label" htmlFor={id}>
          {label}
        </label>
        <input
          ref={(ref) => { this.input = ref }}
          type={type}
          className="form-control"
          id={id}
          name="at-field-email"
          placeholder={hint}
          autoCapitalize="none"
          autoCorrect="off"
          required={required}
          onChange={onChange}
          defaultValue={defaultValue}
        />
        {message && <span className={`help-block ${message.type}`}>{message.message}</span>}
      </div>
    )
  }
}

Accounts.ui.Field = Field
const buttonTexts = {
  switchToSignUp: 'Don\'t have an account?',
}
const Button = memo(({
  id,
  label,
  href,
  type = 'button',
  disabled = false,
  className = '',
  onClick,
}) => (type === 'link' ? (
  <div className="at-signup-link">
    <p>
      {buttonTexts[id] && `${buttonTexts[id]} `}
      <Link to={href}>{label}</Link>
    </p>
  </div>
) : (
  <button
    type={type}
    className={`at-btn submit btn btn-lg btn-block btn-light ${className}`}
    disabled={disabled}
    onClick={onClick}
  >
    {label}
  </button>
)))
Accounts.ui.Button = Button

const authForm = state => props => (
  <div className="container">
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <Accounts.ui.LoginForm formState={state} {...props} />
      </div>
    </div>
  </div>
)
const Login = authForm()
const Signup = authForm(STATES.SIGN_UP)
const Reset = authForm(STATES.PASSWORD_RESET)
const Password = authForm(STATES.PASSWORD_CHANGE)

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
