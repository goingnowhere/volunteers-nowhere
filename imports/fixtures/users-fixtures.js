import { Roles } from 'meteor/piemonkey:roles'
import { Accounts } from 'meteor/accounts-base'
import { enrollUser } from '../../server/methods'

const defaultUsers = [
  {
    name: 'manager',
    email: 'manager@example.com',
    password: 'apple1',
    roles: ['manager'],
  },
  {
    name: 'admin',
    email: 'admin@example.com',
    password: 'apple1',
    roles: ['admin'],
  },
  {
    name: 'normal user',
    email: 'normal@example.com',
    password: 'apple1',
    roles: ['user'],
  },
]

const enrolledUsers = [
  {
    email: 'enrolled@example.com',
    profile: {
      firstName: 'enrolled',
      lastName: 'test',
      ticketNumber: '435575677',
      ticketDate: new Date(),
      manualRegistration: false,
    },
  },
]

export const createUsers = (Volunteers) => {
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

  /* _.each(enrolledUsers, (options) => {
    if (!Meteor.users.findOne({ 'emails.address': options.email })) {
      console.log('Eroll user ', options)
      enrollUser.call({ email: options.email, profile: options.profile })
    }
  }) */
}

// _.each(enrolledUsers, (options) => {
//   // if (!Meteor.users.findOne({ 'emails.address': options.email })) {
//   console.log('Eroll user ', options)
//   enrollUser.call({ email: options.email, profile: options.profile })
//   // }
// })
