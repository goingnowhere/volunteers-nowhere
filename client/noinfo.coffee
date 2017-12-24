Template.noInfoDashboard.onCreated () ->
  template = this
  template.subscribe("test.Volunteers.team")
  template.subscribe("test.Volunteers.department")

  template.currentDay = new ReactiveVar()
  template.searchQuery = new ReactiveVar({})

Template.noInfoDashboard.helpers
  'allTeams': (day) ->
    Volunteers.Collections.Team.find()
  'allDepartments': (day) ->
    Volunteers.Collections.Department.find()
  'searchQuery': () ->
    Template.instance().searchQuery

Template.noInfoDashboard.events
  'click [data-action="teamSwitch"]': (event,template) ->
    id = $(event.target).data('id')
    template.searchQuery.set({teams: [id]})
  'click [data-action="deptSwitch"]': (event,template) ->
    id = $(event.target).data('id')
    template.searchQuery.set({departments: [id]})
