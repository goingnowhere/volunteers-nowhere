import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'

const addUser = (user, fakeEmail = null) => {
  const profile = {
    firstName: user.FirstName,
    lastName: user.LastName,
    ticketNumber: user.TicketId,
    /* TODO: assuming UTC date */
    ticketDate: new Date(user.DateAdded),
    manualRegistration: false,
  }
  let userId = {}
  if (fakeEmail) {
    userId = Accounts.createUser({
      email: fakeEmail,
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
  Meteor.users.update({ _id: userId }, {
    $set: {
      'emails.0.verified': (userId) && (!fakeEmail),
    },
  })
}

export const pendingUsers = new Mongo.Collection('pendingUsers')

/*  Add the user to a collection */
const addUserToPending = (user) => {
  pendingUsers.upsert({ TicketId: user.TicketId }, user)
}

export const importUsers = (guestsFile) => {
  const users = JSON.parse(Assets.getText(guestsFile))
  users.forEach((user) => {
    console.log('Create User', user.Email)
    const userExists = Accounts.findUserByEmail(user.Email)
    if (userExists) {
      // user was manually created and has the same email
      if (userExists.profile.ticketNumber === 'Manual registration') {
        console.log('Update existing', userExists.emails[0].address)
        Meteor.users.update({ _id: userExists._id }, {
          $set: {
            'profile.ticketNumber': user.TicketId,
            'profile.ticketDate': new Date(user.DateAdded),
            'profile.manualRegistration': false,
          },
        })
      } else if (!(userExists.profile.ticketNumber === user.TicketId)) {
        // the user was previously created and is has a different ticket number
        /* the same email for two users. We create two accounts. one with the real email
        and the second one with a random email. The enrollment email will contain
        two links to enroll both accounts */
        console.log('Duplicate email', userExists.emails[0].address)
        const fakeEmail = `${Random.id()}@email.invalid`
        addUser(user, fakeEmail) // add user with invalid email
        addUserToPending({ ...user, fakeEmail }) // add user to a list of yet to be validated users
      }
    } else {
      // the user does not exists
      addUser(user)
    }
  })
}
