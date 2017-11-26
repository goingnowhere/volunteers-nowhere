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

# Router.route '/team',
#   name: 'teamProfile'
#   layoutTemplate: 'userLayout'
#
# Router.route '/department',
#   name: 'departmentProfile'
#   layoutTemplate: 'userLayout'

# after login (XXX we should use the iron router auth submodule ... )
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

# manager pages

Router.route '/manager/userform',
  name: 'managerUserForm'
  controller: ManagerController

# lead pages
Router.route '/lead/users',
  name: 'allUsersList'
  controller: LeadController
