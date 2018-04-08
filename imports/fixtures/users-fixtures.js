import { Roles } from 'meteor/piemonkey:roles'

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

export const createUsers = (Volunteers) => {
  _.each(defaultUsers, (options) => {
    if (!Meteor.users.findOne({ 'emails.address': options.email })) {
      console.log('Create user ', options)
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
}
