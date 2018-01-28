import { Router, RouteController } from 'meteor/iron:router'
import { AccountsTemplates } from 'meteor/useraccounts:core'
import { Volunteers } from './init'

Router.plugin('auth', {
  authenticate: {
    route: 'atSignIn',
  },
  except: [
    'atSignIn', 'atSignUp', 'changePwd', 'resetPwd', 'forgotPwd', 'enrollAccount',
    'homePage', 'signups', 'organization'],
})
Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' })

const BaseController = RouteController.extend({
  fastRender: true,
  loadingTemplate: 'loadingTemplate',
})

const AnonymousController = BaseController.extend({
  // layoutTemplate: 'userLayout',
})

const AuthenticatedController = AnonymousController.extend({
  layoutTemplate: 'userLayout',
})

const LeadController = AuthenticatedController.extend({
})

const ManagerController = AuthenticatedController.extend({
})

// public pages
Router.route('/', {
  name: 'homePage',
  controller: BaseController,
})

Router.route('/signups', {
  name: 'signups',
  controller: AnonymousController,
})

Router.route('/organization', {
  name: 'organization',
  controller: AnonymousController,
})

Router.route('/team/:_id', {
  name: 'publicTeamView',
  controller: AnonymousController,
  waitOn: function () {
    if (this.params && this.params._id) {
      sel = {_id: this.params._id}
      return [Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`,sel)]
    }
  },
  data: function () {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Team.findOne(this.params._id)
    }
    return null
  },
})

Router.route('/department/:_id', {
  name: 'publicDepartmentView',
  controller: AnonymousController,
  waitOn: function () {
    if (this.params && this.params._id) {
      sel = {_id: this.params._id}
      return [
        Meteor.subscribe(`${Volunteers.eventName}.Volunteers.department`,sel)
      ]
    }
  },
  data: function () {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Department.findOne(this.params._id)
    }
    return null
  },
})

// after login
Router.route('/dashboard', {
  name: 'userDashboard',
  controller: AuthenticatedController,
  onBeforeAction: function () {
    var user = Meteor.user();
    if (user) {
      if (Volunteers.Collections.VolunteerForm.findOne({userId:user._id})) {
        this.next()
      } else {
        this.redirect('/profile')
      }
    } else {
      this.redirect('atSignIn')
    }
  },
  waitOn: function () {
    return [
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`),
      // Meteor.subscribe(`meteor-user-profiles.ProfilePictures`)
    ]
  }
})

Router.route('/profile', {
  name: 'volunteerForm',
  controller: AuthenticatedController,
})

Router.route('/profile/display', {
  name: 'volunteerFormDisplay',
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

Router.route('/manager/userform', {
  name: 'managerUserForm',
  controller: ManagerController,
})

// leads / metaleads
Router.route('/admin/users', {
  name: 'allUsersList',
  controller: LeadController,
  waitOn: function () {
    return [ Meteor.subscribe(`${Volunteers.eventName}.allUsers`) ]
  },
})

// lead pages
Router.route('/lead', {
  name: 'leadDashboard',
  controller: LeadController,
  // XXX restrict access only to the lead of this team, or the metalead of the dept or manager
  // XXX this waitOn cause a flikering because I force the whole page to be re-rendered. Maybe
  // there is a better way to do it
  // waitOn() { return [Meteor.subscribe(`${Volunteers.eventName}.Volunteers.allDuties.byTeam`, this.params._id)] },
})

Router.route('/lead/team/:_id', {
  name: 'leadTeamView',
  controller: LeadController,
  // XXX restrict access only to the lead of this team, or the metalead of the dept or manager
  // XXX this waitOn cause a flikering because I force the whole page to be re-rendered. Maybe
  // there is a better way to do it
  // waitOn() { return [Meteor.subscribe(`${Volunteers.eventName}.Volunteers.allDuties.byTeam`, this.params._id)] },
  waitOn: function () {
    if (this.params && this.params._id) {
      sel = {_id: this.params._id}
      return [
        Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`,sel)
      ]
    }
  },
  data: function () {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Team.findOne(this.params._id)
    }
    return null
  },
})

// metalead pages
Router.route('/metalead', {
  name: 'metaleadDashboard',
  controller: LeadController,
  // XXX restrict access only to the metalead of this team, or manager
  // XXX this waitOn cause a flikering because I force the whole page to be re-rendered. Maybe
  // there is a better way to do it
  // waitOn() { return [Meteor.subscribe(`${Volunteers.eventName}.Volunteers.allDuties.byTeam`, this.params._id)] },
})

Router.route('/metalead/department/:_id', {
  name: 'metaleadDepartmentView',
  controller: LeadController,
  // XXX restrict access only to the metalead of the dept or manager
  waitOn: function () {
    if (this.params && this.params._id) {
      sel = {_id: this.params._id}
      return [
        Meteor.subscribe(`${Volunteers.eventName}.Volunteers.department`,sel)
      ]
    }
  },
  data: function () {
    if (this.params && this.params._id && this.ready()) {
      return Volunteers.Collections.Department.findOne(this.params._id)
    }
    return null
  },
})

// noInfo pages
Router.route('/noinfo', {
  name: 'noInfoDashboard',
  controller: LeadController,
})

Router.route('/noinfo/newuser', {
  name: 'noInfoNewUser',
  controller: LeadController,
})

Router.route('/noinfo/userList', {
  name: 'noInfoAllUsers',
  // XXX for the moment, but this should be a restricted version without
  // manager or lead annotations or restricted information
  template: 'allUsersList',
  controller: LeadController,
  waitOn: function () {
    return [Meteor.subscribe(`${Volunteers.eventName}.allUsers`)]
  },
})
