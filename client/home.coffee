Template.teamList.onCreated () ->
  this.subscribe('users')
  this.subscribe("test.Volunteers.team")

Template.teamList.helpers
  'team': () -> Volunteers.Collections.Team.find()

Template.departmentsList.onCreated () ->
  this.subscribe('users')
  this.subscribe("test.Volunteers.department")

Template.departmentsList.helpers
  'departments': () -> Volunteers.Collections.Department.find()

Template.divisionsList.onCreated () ->
  this.subscribe('users')
  this.subscribe("test.Volunteers.division")

Template.divisionsList.helpers
  'divisions': () -> Volunteers.Collections.Division.find()
