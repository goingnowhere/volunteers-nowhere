Router.plugin('auth',
  authenticate:
    route: 'atSignIn'
  except: [
    'atSignIn','atSignUp','changePwd','resetPwd','forgotPwd','enrollAccount',
    'homePage','signups','organization', ]
)
Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' })

BaseController = RouteController.extend(
  loadingTemplate: 'loadingTemplate'
)

AnonymousController = BaseController.extend(
  layoutTemplate: 'userLayout'
)

AuthenticatedController = AnonymousController.extend(
  fastRender: true
  onBeforeAction: ['authenticate']
)

LeadController = AuthenticatedController.extend(
  onBeforeAction: ['authenticate']
)

ManagerController = AuthenticatedController.extend(
  onBeforeAction: ['authenticate']
)

# public pages
Router.route '/',
  name: 'homePage'
  controller: BaseController

Router.route '/signups',
  name: 'signups'
  controller: AnonymousController

Router.route '/organization',
  name: 'organization'
  controller: AnonymousController

Router.route '/team/:_id',
  name: 'publicTeamView'
  controller: AnonymousController
  waitOn: () -> [ Meteor.subscribe("#{Volunteers.eventName}.Volunteers.team") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Team.findOne(this.params._id)

Router.route '/department/:_id',
  name: 'publicDepartmentView'
  controller: AnonymousController
  waitOn: () -> [ Meteor.subscribe("#{Volunteers.eventName}.Volunteers.department") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Department.findOne(this.params._id)

# after login
Router.route '/dashboard',
  name: 'dashboard'
  controller: AuthenticatedController

Router.route '/profile',
  name: 'userProfile'
  controller: AuthenticatedController

Router.route '/profile/settings',
  name: 'accountSettings'
  controller: AuthenticatedController

Router.route '/profile/edit',
  name: 'userProfileEdit'
  controller: AuthenticatedController

Router.route '/sign-out',
  name: 'atSignOut'
  onBeforeAction: AccountsTemplates.logout

# settings / administrative pages pages
# accessible either to leads / metalead or manager

# manager only
Router.route '/manager',
  name: 'managerView'
  controller: ManagerController

Router.route '/manager/userform',
  name: 'managerUserForm'
  controller: ManagerController

# leads / metaleads
Router.route '/admin/users',
  name: 'allUsersList'
  controller: LeadController
  waitOn: () -> [ Meteor.subscribe("#{Volunteers.eventName}.allUsers") ]

# lead pages
Router.route '/lead/team/:_id',
  name: 'leadTeamView'
  controller: LeadController
  # XXX restrict access only to the lead of this team, or the metalead of the dept or manager
  waitOn: () -> [ Meteor.subscribe("#{Volunteers.eventName}.Volunteers.team") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Team.findOne(this.params._id)

# metalead pages
Router.route '/metalead/department/:_id',
  name: 'metaleadDepartmentView'
  controller: LeadController
  # XXX restrict access only to the metalead of the dept or manager
  waitOn: () -> [ Meteor.subscribe("#{Volunteers.eventName}.Volunteers.department") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Department.findOne(this.params._id)

# noInfo pages
Router.route '/noinfo',
  name: 'noInfoDashboard'
  controller: LeadController

Router.route '/noinfo/newuser',
  name: 'noInfoNewUser'
  controller: LeadController

Router.route '/noinfo/userList',
  name: 'noInfoAllUsers'
  # XXX for the moment, but this should be a restricted version without
  # manager or lead annotations or restricted information
  template: 'allUsersList'
  controller: LeadController
  waitOn: () -> [ Meteor.subscribe("#{Volunteers.eventName}.allUsers") ]
