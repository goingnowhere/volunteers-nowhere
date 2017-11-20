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

Template.home.onCreated () ->
  this.subscribe('test.Volunteers.volunteerForm')

Template.home.helpers
  profileCreated: () =>
    Volunteers.Collections.VolunteerForm.findOne({ userId: Meteor.userId() })

Template.volunteerHome.helpers
  'name': () ->
    userId = Meteor.userId()
    user = Meteor.users.findOne(userId)
    complete = false
    if user
      if complete
        "#{user.profile.firstName} #{user.profile.firstName} <#{user.emails[0].address}>"
      else if (user.profile?.firstName)
        "#{user.profile.firstName}"
      else if user.profile?.lastName?
        "#{user.profile.lastName}"
      else user.emails[0].address
