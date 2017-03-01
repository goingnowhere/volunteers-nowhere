
Meteor.publish 'Volunteers.teams', () -> share.Teams.find()

Meteor.publish 'Volunteers.shifts', () ->
  if Roles.userIsInRole(this.userId, [ 'manager' ])
    share.Shifts.find()
  else
    share.Shifts.find({usersId: this.userId})

Meteor.publish 'Volunteers.tasks', () ->
  if Roles.userIsInRole(this.userId, [ 'manager' ])
    share.Tasks.find()
  else
    Tasks.find({usersId: this.userId})

Meteor.publish 'Volunteers.volunteerForm', () ->
  if Roles.userIsInRole(this.userId, [ 'manager' ])
    share.VolunteerForm.find()
  else
    share.VolunteerForm.find(this.userId)

Meteor.publish "Volunteers.users", () ->
  if Roles.userIsInRole(this.userId, [ 'manager' ])
    Meteor.users.find()
