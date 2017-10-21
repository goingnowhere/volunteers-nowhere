Router.configure
  layoutTemplate: 'userLayout'

Router.route '/',
  name: 'home'
  template: 'home'

Router.route '/team/list',
  name: 'teamList'
  template: 'teamList'

Router.route '/division/list',
  name: 'divisionsList'
  template: 'divisionsList'

Router.route '/department/list',
  name: 'departmentsList'
  template: 'departmentsList'

Router.route '/volunteer',
  name: 'volunteerForm'
  template: 'volunteer'

Router.route '/volunteer/shifts',
  name: 'volunteerShifts'
  template: 'volunteerShifts'

Router.route '/admin/volunteer/form',
  name: 'volunteerFormBuilder'
  template: 'volunteerFormBuilder'
