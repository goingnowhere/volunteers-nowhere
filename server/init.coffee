import { Volunteers } from '/both/init'

Meteor.startup ->
  # console.log "startup #{Volunteers.eventName}"
  allRoles = ['admin','manager','user']
  if Meteor.roles.find({ _id: { $in: allRoles } }).count() < 1
    for role in allRoles
      Roles.createRole role

  defaultUsers = [
    {
      email: 'manager@example.com',
      password: 'apple1'
      roles: ['manager']
    },
    {
      email: 'admin@example.com',
      password: 'apple1'
      roles: ['admin']
    },
    {
      email: 'normal@example.com',
      password: 'apple1'
      roles: ['user']
    },
  ]

  _.each defaultUsers, (options) ->
    if !Meteor.users.findOne({ "emails.address" : options.email })
      userId = Accounts.createUser(options)
      Meteor.users.update(userId, {$set: {"emails.0.verified" :true}})
      for role in options.roles
        if role == 'admin'
          Roles.addUsersToRoles(userId, role)
        else
          Roles.addUsersToRoles(userId, role, Volunteers.eventName)

  require('../imports/fixtures/index')
  share.runFixtures(Volunteers)
