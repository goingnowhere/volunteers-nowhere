
Template.publicDepartmentView.onCreated () ->
  template = this
  this.departmentId = template.data._id
  # XXX this should just fetch the teams of this dept
  template.subscribe("#{Volunteers.eventName}.Volunteers.organization")

Template.publicDepartmentView.helpers
  'teams': () ->
    template = Template.instance()
    Volunteers.Collections.Team.find({parentId: template.departmentId})
  canEditTeam: () =>
    template = Template.instance()
    Volunteers.isManagerOrLead(Meteor.userId(),template.departmentId)

Template.leadTeamView.onCreated () ->
  template = this
  teamId = template.data._id
  template.subscribe("#{Volunteers.eventName}.Volunteers.team",teamId)

Template.leadTeamView.events
  'click [data-action="settings"]': (event,template) ->
    team = Volunteers.Collections.Team.findOne(template.data._id)
    ModalShowWithTemplate("teamEdit",team)

Template.metaleadDepartmentView.onCreated () ->
  template = this
  departmentId = template.data._id
  template.subscribe("#{Volunteers.eventName}.Volunteers.department",departmentId)

Template.metaleadDepartmentView.events
  'click [data-action="settings"]': (event,template) ->
    dept = Volunteers.Collections.Department.findOne(template.data._id)
    ModalShowWithTemplate("departmentEdit",dept)
