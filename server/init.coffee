Meteor.startup ->
  allRoles = ['manager']
  if Meteor.roles.find().count() < 1
    for role in allRoles
      Roles.createRole role

  defaultUsers = [
    {
      email: 'admin@example.com',
      password: 'apple1'
      profile: {
        role: 'manager'}
    },
  ]

  _.each defaultUsers, (options) ->
    if !Meteor.users.findOne({ "emails.address" : options.email })
      role = options.profile.role
      userId = Accounts.createUser(options)
      Meteor.users.update(userId, {$set: {"emails.0.verified" :true}})
      Roles.addUsersToRoles(userId, role)
