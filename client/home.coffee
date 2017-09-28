Template.teamList.onCreated () ->
  this.subscribe('users')
  this.subscribe('Volunteers.team')

Template.teamList.helpers
  'team': () -> Volunteers.Collections.Team.find()

Template.departmentsList.onCreated () ->
  this.subscribe('users')
  this.subscribe('Volunteers.department')

Template.departmentsList.helpers
  'departments': () -> Volunteers.Collections.Department.find()

Template.divisionsList.onCreated () ->
  this.subscribe('users')
  this.subscribe('Volunteers.division')

Template.divisionsList.helpers
  'divisions': () -> Volunteers.Collections.Division.find()

# AutoForm.addHooks ['InsertDivisionsFormId'],
#   onSuccess: (formType, result) ->
#     router.go .

# AutoForm.addHooks ['InsertDepartmentsFormId'],
#   onSuccess: (formType, result) ->
#     router.go .

# AutoForm.addHooks ['InsertTeamFormId'],
#   onSuccess: (formType, result) ->
#     router.go .
