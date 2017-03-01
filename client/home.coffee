Template.teamList.onCreated () ->
  this.subscribe('users')
  this.subscribe('teams')

Template.teamList.helpers
  'teams': () -> Volunteers.Collections.Teams.find().fetch()
