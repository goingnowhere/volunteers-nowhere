import { Router, RouteController } from 'meteor/iron:router'
import { AccountsTemplates } from 'meteor/useraccounts:core'
import { Volunteers } from './init'
import './accounts'

AccountsTemplates.configureRoute('signIn', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('changePwd', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('resetPwd', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('forgotPwd', { redirect: '/dashboard' })
AccountsTemplates.configureRoute('enrollAccount', { redirect: '/dashboard' })

Router.plugin('auth', {
  authenticate: {
    route: 'atSignIn',
  },
  except: [
    'atSignIn', 'atSignUp',
    'atChangePwd', 'atEnrollAccount',
    'atForgotPwd', 'atResetPwd',
    'homePage',
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

const LeadController = AuthenticatedController.extend({
})

const ManagerController = AuthenticatedController.extend({
})

// public pages
Router.route('/', {
  name: 'homePage',
  controller: BaseController,
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
  waitOn() {
    return [
      Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, Meteor.userId()),
    ]
  },
})

Router.route('/profile/settings', {
  name: 'accountSettings',
  controller: AuthenticatedController,
  waitOn() {
    return [
      Meteor.subscribe('meteor-user-profiles.ProfilePictures'),
    ]
  },
})

Router.route('/sign-out', {
  name: 'atSignOut',
  onBeforeAction: AccountsTemplates.logout,
})

// XXX: Unused for the moment
// Router.route('/signups', {
//   name: 'signupsAll',
//   controller: AuthenticatedController,
// })
//
// Router.route('/signups/leads', {
//   name: 'signupsLeads',
//   template: 'signupsList',
//   controller: AuthenticatedController,
//   data: () => ({
//     searchQuery: new ReactiveVar({ limit: 4, duties: ['lead'] }),
//   }),
// })
//
// Router.route('/signups/shifts', {
//   name: 'signupsShifts',
//   template: 'signupsList',
//   controller: AuthenticatedController,
//   data: () => ({
//     searchQuery: new ReactiveVar({ limit: 4, duties: ['shift'] }),
//   }),
// })
//
// Router.route('/signups/shifts/:_id', {
//   name: 'signupsShiftTeam',
//   template: 'signupsList',
//   controller: AuthenticatedController,
//   data() {
//     if (this.params && this.params._id) {
//       const teamId = this.params._id
//       return {
//         searchQuery: new ReactiveVar({ limit: 4, duties: ['shift'], teams: [teamId] }),
//       }
//     }
//     return null
//   },
// })

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

// leads / metaleads
// Router.route('/admin/users', {
//   name: 'allUsersList',
//   controller: LeadController,
//   waitOn() {
//     return [Meteor.subscribe(`${Volunteers.eventName}.allUsers`)]
//   },
// })

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
  controller: LeadController,
})

Router.route('/noinfo/newuser', {
  name: 'noInfoNewUser',
  controller: LeadController,
})

Router.route('/noinfo/userList', {
  name: 'noInfoUserList',
  controller: LeadController,
  data() { return { page: 'NoInfoUserPages' } },
})

// Router.route('/noinfo/user/:_id', {
//   name: 'volunteerFormDisplay',
//   controller: AuthenticatedController,
//   data: function() {
//     if (this.params && this.params._id && this.ready()) {
//       var user = this.params._id;
//       form = Volunteers.Collections.VolunteerForm.findOne({userId:user._id});
//       return { formName: "VolunteerForm", form: form, user: user};
//     }
//   },
//   waitOn: function () {
//     if (this.params && this.params._id) {
//       var user = this.params._id;
//       return [
//         Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`,{userId: userId}),
//         Meteor.subscribe(`meteor-user-profiles.ProfilePictures`,userId)
//       ];
//     }
//   }
// });
