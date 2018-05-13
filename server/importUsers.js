import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'

const addUser = (user, username = null) => {
  const profile = {
    firstName: user.FirstName,
    lastName: user.LastName,
    ticketNumber: user.TicketId,
    /* TODO: assuming UTC date */
    ticketDate: new Date(user.DateAdded),
    manualRegistration: false,
  }
  let userId = {}
  if (username) {
    userId = Accounts.createUser({
      username,
      terms: false,
      profile,
    })
  } else {
    userId = Accounts.createUser({
      email: user.Email,
      terms: false,
      profile,
    })
  }
  if ((userId) && (!username)) {
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
    console.log('Create User', user.Email)
    const userExists = Accounts.findUserByEmail(user.Email)
    if (!userExists) {
      addUser(user)
    } else if (!(userExists.profile.ticketNumber === user.TicketId)) {
      console.log('Duplicate email', userExists.emails[0].address)
      const username = Random.id()
      /* the same email for two users. We create two accounts. one with the email
      and the second one with a random username. The enrollment email will contain
      two links to enroll both accounts */
      addUser(user, username)
      registerUser({ ...user, username })
    } else if (userExists.profile.ticketNumber === 'Manual registration') {
      console.log('Update existing', userExists.emails[0].address)
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
