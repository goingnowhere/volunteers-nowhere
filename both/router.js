import { Router, RouteController } from 'meteor/iron:router'
import { AccountsTemplates } from 'meteor/useraccounts:core'
import { Volunteers } from './init'
import './accounts'

Router.plugin('auth', {
  authenticate: {
    route: 'atSignIn',
  },
  except: [
    'atSignIn', 'atSignUp',
    'atChangePwd', 'atEnrollAccount',
    'atForgotPwd', 'atResetPwd',
    'homePage', 'volAgreement',
  ],
})

Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' })

const BaseController = RouteController.extend({
  fastRender: true,
  loadingTemplate: 'loadingTemplate',
})

const AnonymousController = BaseController.extend({
  layoutTemplate: 'homeLayout',
})

const AuthenticatedController = AnonymousController.extend({
  layoutTemplate: 'userLayout',
  waitOn() {
    const userId = Meteor.userId()
    return [
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId),
      Meteor.subscribe('meteor-user-profiles.ProfilePictures', userId),
    ]
  },
})

const NoInfoController = AuthenticatedController.extend({
  waitOn() {
    return [
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`),
    ]
  },
  onBeforeAction() {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    if (Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id])) {
      this.next()
    } else {
      this.redirect('userDashboard')
    }
  },
  onRun() {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    if (Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id])) {
      this.next()
    } else {
      this.redirect('userDashboard')
    }
  },
})

const LeadController = AuthenticatedController.extend({
  onBeforeAction() {
    if (Volunteers.isManagerOrLead(Meteor.userId(), [this.params._id])) {
      this.next()
    } else {
      this.render('userDashboard')
    }
  },
  onRun() {
    if (Volunteers.isManagerOrLead(Meteor.userId(), [this.params._id])) {
      this.next()
    } else {
      this.render('userDashboard')
    }
  },
})

const ManagerController = AuthenticatedController.extend({
  onBeforeAction() {
    if (Volunteers.isManager()) {
      this.next()
    } else {
      this.redirect('userDashboard')
    }
  },
  onRun() {
    if (Volunteers.isManager()) {
      this.next()
    } else {
      this.redirect('userDashboard')
    }
  },
})

AccountsTemplates.configureRoute('signIn', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('changePwd', {
  redirect: '/dashboard',
  layoutTemplate: 'userLayout',
})
AccountsTemplates.configureRoute('resetPwd', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('forgotPwd', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('enrollAccount', { redirect: '/dashboard' })

// public pages
Router.route('/', {
  name: 'homePage',
  controller: BaseController,
})

Router.route('/volunteers-agreement', {
  name: 'volAgreement',
  controller: AnonymousController,
})

Router.route('/organization', {
  name: 'organization',
  controller: AnonymousController,
})

// after login
Router.route('/dashboard', {
  name: 'userDashboard',
  controller: AuthenticatedController,
  onBeforeAction() {
    const user = Meteor.user()
    if (user) {
      if (Volunteers.Collections.VolunteerForm.findOne({ userId: user._id })) {
        this.next()
      } else {
        this.redirect('/profile')
      }
    } else {
      this.redirect('atSignIn')
    }
  },
  waitOn() {
    const userId = Meteor.userId()
    return [
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byUser`, userId),
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byUser`, userId),
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.ProjectSignups.byUser`, userId),
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`, userId),
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`),
    ]
  },
})

Router.route('/team/:_id', {
  name: 'publicTeamView',
  controller: AuthenticatedController,
  waitOn() {
    if (this.params && this.params._id) {
      const sel = { _id: this.params._id }
      return [Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, sel)]
    }
    return null
  },
  data() {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Team.findOne(this.params._id)
    }
    return null
  },
})

Router.route('/department/:_id', {
  name: 'publicDepartmentView',
  controller: AuthenticatedController,
  waitOn() {
    if (this.params && this.params._id) {
      const sel = { _id: this.params._id }
      return [
        Meteor.subscribe(`${Volunteers.eventName}.Volunteers.department`, sel),
      ]
    }
    return null
  },
  data() {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Department.findOne(this.params._id)
    }
    return null
  },
})

Router.route('/profile', {
  name: 'volunteerForm',
  controller: AuthenticatedController,
})

Router.route('/profile/settings', {
  name: 'accountSettings',
  controller: AuthenticatedController,
})

Router.route('/sign-out', {
  name: 'atSignOut',
  onBeforeAction: AccountsTemplates.logout,
})

// settings / administrative pages pages
// accessible either to leads / metalead or manager

// manager only
Router.route('/manager', {
  name: 'managerView',
  controller: ManagerController,
})

// Dynamic form template
Router.route('/manager/userform', {
  name: 'managerUserForm',
  controller: ManagerController,
})

Router.route('/manager/eventSettings', {
  name: 'managerEventSettings',
  controller: ManagerController,
})

Router.route('/manager/emailForms', {
  name: 'managerEmailForms',
  controller: ManagerController,
})

Router.route('/manager/userList', {
  name: 'managerUserList',
  controller: ManagerController,
  data() { return { page: 'ManagerUserPages' } },
})

// lead pages

Router.route('/lead/team/:_id', {
  name: 'leadTeamView',
  controller: LeadController,
  waitOn() {
    if (this.params && this.params._id) {
      const sel = { _id: this.params._id }
      return [
        Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, sel),
      ]
    }
    return null
  },
  data() {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Team.findOne(this.params._id)
    }
    return null
  },
})

// metalead pages

Router.route('/metalead/department/:_id', {
  name: 'metaleadDepartmentView',
  controller: LeadController,
  // XXX restrict access only to the metalead of the dept or manager
  waitOn() {
    if (this.params && this.params._id) {
      const sel = { _id: this.params._id }
      return [
        Meteor.subscribe(`${Volunteers.eventName}.Volunteers.department`, sel),
      ]
    }
    return null
  },
  data() {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Department.findOne(this.params._id)
    }
    return null
  },
})

// noInfo pages
Router.route('/noinfo', {
  name: 'noInfoDashboard',
  controller: NoInfoController,
})

Router.route('/noinfo/newuser', {
  name: 'noInfoNewUser',
  controller: NoInfoController,
})

Router.route('/noinfo/userList', {
  name: 'noInfoUserList',
  controller: NoInfoController,
  data() { return { page: 'NoInfoUserPages' } },
})

/* Router.route('/noinfo/user/:_id', {
  name: 'noInfoUserProfile',
  controller: LeadController,
  data() {
    if (this.params && this.params._id && this.ready()) {
      const user = Meteor.users.findOne(this.params._id)
      const userform = Volunteers.Collections.VolunteerForm.findOne({ userId: user._id })
      return { userform, user }
    } return null
  },
}) */
