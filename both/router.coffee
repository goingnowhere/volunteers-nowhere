
# public pages
Router.route '/',
  name: 'homePage'

Router.route '/signups',
  name: 'signups'
  layoutTemplate: 'userLayout'

Router.route '/organization',
  name: 'organization'
  layoutTemplate: 'userLayout'

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
  layoutTemplate: 'userLayout'

Router.route '/profile',
  name: 'userProfile'
  layoutTemplate: 'userLayout'

Router.route '/profile/settings',
  name: 'accountSettings'
  template: 'userProfile'
  layoutTemplate: 'userLayout'

Router.route '/profile/edit',
  name: 'userProfileEdit'
  layoutTemplate: 'userLayout'
