Meteor.startup ->
  console.log "startup"
  allRoles = ['manager','user']
  if Meteor.roles.find({ _id: { $in: allRoles } }).count() < 1
    for role in allRoles
      Roles.createRole role

  defaultUsers = [
    {
      email: 'admin@example.com',
      password: 'apple1'
      roles: ['manager']
    },
  ]

  _.each defaultUsers, (options) ->
    if !Meteor.users.findOne({ "emails.address" : options.email })
      userId = Accounts.createUser(options)
      Meteor.users.update(userId, {$set: {"emails.0.verified" :true}})
      for role in options.roles
        Roles.addUsersToRoles(userId, role)
