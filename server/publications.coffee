Meteor.publish 'volunteerForm', () ->
  # if Roles.userIsInRole(this.userId, [ 'manager' ])
  VolunteerForm.find()
  # else
    # VolunteerForm.find(this.userId)
