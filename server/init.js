import _ from 'underscore'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import { Volunteers } from '../both/init'
// import { runFixtures } from '../imports/fixtures/index'

Meteor.startup(() => {
  // console.log(`startup ${Volunteers.eventName}`)
  const allRoles = ['admin', 'manager', 'user']
  if (Meteor.roles.find({ _id: { $in: allRoles } }).count() < 1) {
    allRoles.forEach(role => Roles.createRole(role))
  }

  const defaultUsers = [
    {
      email: 'manager@example.com',
      password: 'apple1',
      roles: ['manager'],
    },
    {
      email: 'admin@example.com',
      password: 'apple1',
      roles: ['admin'],
    },
    {
      email: 'normal@example.com',
      password: 'apple1',
      roles: ['user'],
    },
  ]

  _.each(defaultUsers, (options) => {
    if (!Meteor.users.findOne({ 'emails.address': options.email })) {
      const userId = Accounts.createUser(options)
      Meteor.users.update(userId, { $set: { 'emails.0.verified': true } })
      options.roles.forEach((role) => {
        if (role === 'admin') {
          Roles.addUsersToRoles(userId, role)
        } else {
          Roles.addUsersToRoles(userId, role, Volunteers.eventName)
        }
      })
    }
  })

  const runFixtures = require('../imports/fixtures/index')
  return runFixtures(Volunteers)
})
