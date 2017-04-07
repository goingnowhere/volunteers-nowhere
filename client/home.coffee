Template.teamsList.onCreated () ->
  this.subscribe('users')
  this.subscribe('Volunteers.teams')

Template.teamsList.helpers
  'teams': () -> Volunteers.Collections.Teams.find()
