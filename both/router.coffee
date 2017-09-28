Router.configure
  layoutTemplate: 'userLayout'

Router.route '/',
  name: 'home'
  template: 'home'

Router.route '/dashborad/team/:_id',
  name: 'teamDayViewGrid'
  template: 'teamDayViewGrid'
  waitOn: () -> [ Meteor.subscribe("Volunteers.team") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Team.findOne(this.params._id)

Router.route '/team/list',
  name: 'teamList'
  template: 'teamList'

Router.route '/division/list',
  name: 'divisionsList'
  template: 'divisionsList'

Router.route '/department/list',
  name: 'departmentsList'
  template: 'departmentsList'

Router.route '/team/add',
  name: 'teamAdd'
  template: 'teamView'

Router.route '/team/edit/:_id',
  name: 'teamView'
  template: 'teamView'
  waitOn: () -> [ Meteor.subscribe("Volunteers.team") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Team.findOne(this.params._id)

Router.route '/department/add',
  name: 'departmentAdd'
  template: 'departmentView'

Router.route '/department/edit/:_id',
  name: 'departmentView'
  template: 'departmentView'
  waitOn: () -> [ Meteor.subscribe("Volunteers.department") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Department.findOne(this.params._id)

Router.route '/division/add',
  name: 'divisionAdd'
  template: 'divisionView'

Router.route '/division/edit/:_id',
  name: 'divisionView'
  template: 'divisionView'
  waitOn: () -> [ Meteor.subscribe("Volunteers.division") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Division.findOne(this.params._id)

Router.route '/volunteer',
  name: 'volunteerForm'
  template: 'volunteer'

Router.route '/volunteer/shifts',
  name: 'volunteerShifts'
  template: 'volunteerShifts'

Router.route '/admin/volunteer/form',
  name: 'volunteerFormBuilder'
  template: 'volunteerFormBuilder'
