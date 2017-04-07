Router.configure
  layoutTemplate: 'userLayout'

Router.route '/',
  name: 'home'
  template: 'home'

Router.route '/teams/list',
  name: 'teamsList'
  template: 'teamsList'

Router.route '/teams/add',
  name: 'teamsAdd'
  template: 'teamsView'

Router.route '/teams/edit/:_id',
  name: 'teamsView'
  template: 'teamsView'
  waitOn: () -> [ Meteor.subscribe("Volunteers.teams") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Volunteers.Collections.Teams.findOne(this.params._id)

Router.route '/volunteer',
  name: 'volunteerForm'
  template: 'volunteer'

Router.route '/volunteer/shifts',
  name: 'volunteerShifts'
  template: 'volunteerShifts'

Router.route '/admin/volunteer/form',
  name: 'volunteerFormBuilder'
  template: 'volunteerFormBuilder'
