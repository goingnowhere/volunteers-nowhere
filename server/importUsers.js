import { Accounts } from 'meteor/accounts-base'

const addUser = (user) => {
  const profile = {
    firstName: user.FirstName,
    lastName: user.LastName,
    ticketNumber: user.TicketId,
    /* TODO: assuming UTC date */
    ticketDate: new Date(user.DateAdded),
    manualRegistration: false,
  }
  const userId = Accounts.createUser({
    email: user.Email,
    terms: false,
    profile,
  })
  if (userId) {
    Meteor.users.update({ _id: userId }, {
      $set: {
        'emails.0.verified': true,
      },
    })
  }
}

export const pendingUsers = new Mongo.Collection('pendingUsers')

/*  Add the user to a collection */
const registerUser = (user) => {
  pendingUsers.insert(user)
}

export const importUsers = (guestsFile) => {
  const users = JSON.parse(Assets.getText(guestsFile))
  users.forEach((user) => {
    console.log('Create User', user)
    const userExists = Accounts.findUserByEmail(user.Email)
    if (!userExists) {
      addUser(user)
    } else if (!(userExists.profile.ticketNumber === user.TicketId)) {
      console.log('Duplicate email', userExists)
      registerUser(user)
    } else if (userExists.profile.ticketNumber === 'Manual registration') {
      console.log('Update existing', userExists)
      Meteor.users.update({ _id: userExists._id }, {
        $set: {
          'profile.ticketNumber': user.TicketId,
          'profile.ticketDate': new Date(user.DateAdded),
          'profile.manualRegistration': false,
        },
      })
    }
  })
}
