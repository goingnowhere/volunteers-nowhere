import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Accounts } from 'meteor/accounts-base'

const defaultUsers = [
  {
    name: 'manager',
    email: 'manager@example.com',
    password: 'testtest',
    roles: ['manager'],
  },
  {
    name: 'admin',
    email: 'admin@example.com',
    password: 'testtest',
    roles: ['admin'],
  },
  {
    name: 'normal user',
    email: 'normal@example.com',
    password: 'testtest',
    roles: ['user'],
  },
]

export const createUserFixtures = (Volunteers) => {
  _.each(defaultUsers, (options) => {
    if (!Meteor.users.findOne({ 'emails.address': options.email })) {
      console.log('Create user ', options)
      options.profile = {
        firstName: options.name,
        nickname: options.name,
      }
      const userId = Accounts.createUser(options)
      Meteor.users.update(userId, {
        $set: {
          'emails.0.verified': true,
          'profile.firstName': options.name,
        },
      })
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
