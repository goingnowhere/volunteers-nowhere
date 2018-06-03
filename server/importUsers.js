import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'
import { Volunteers } from '../both/init'

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
  return userId
}

export const pendingUsers = new Mongo.Collection('pendingUsers')

/*  Add the user to a collection */
const addUserToPending = (user) => {
  pendingUsers.upsert({ TicketId: user.TicketId }, user)
}

export const Tickets = new Mongo.Collection('tickets')
const NewTickets = new Mongo.Collection('newTickets')

export const importUsers = (guestsFile) => {
  console.log(Assets.absoluteFilePath(guestsFile))
  const users = JSON.parse(Assets.getText(guestsFile))
  NewTickets.remove({})
  users.forEach((user) => {
    // we add the new ticket to a temporary collection that we will use later
    // to remove old users with no associated ticket
    NewTickets.insert(user)
    const ticketExists = Tickets.findOne({ ticketNumber: Number(user.TicketId) })

    if (!ticketExists) {
      const userExists = Accounts.findUserByEmail(user.Email)
      if (userExists) {
        // the user exists and it's a snowflake
        if (userExists.profile.ticketNumber === 0) {
          console.log('Update existing', userExists.emails[0].address)
          Meteor.users.update({ _id: userExists._id }, {
            $set: {
              'profile.ticketNumber': Number(user.TicketId),
              'profile.ticketDate': new Date(user.DateAdded),
              'profile.manualRegistration': false,
              'emails.0.verified': true,
            },
          })
        } else if (Number(userExists.profile.ticketNumber) !== user.TicketId) {
        // the user was previously created and is has a different ticket number
        /* the same email for two users. We create two accounts. one with the real email
        and the second one with a random email. The enrollment email will contain
        two links to enroll both accounts */
          console.log('Duplicate email', userExists.emails[0].address)
          const fakeEmail = `${Random.id()}@email.invalid`
          addUser(user, fakeEmail) // add user with invalid email
          // add user to a list of yet to be validated users
          addUserToPending({ ...user, fakeEmail })
        }
      } else {
      // ticket does not exists and user does not exists : we create the user
        const userId = addUser(user)
        console.log(`Create User ${userId}`, user.Email)
        Tickets.insert({ userId, ticketNumber: Number(user.TicketId), email: user.Email })
      }
    }
    // we ship this user
    return null
  })
  Tickets.find().forEach((u) => {
    if (!NewTickets.findOne({ TicketId: u.ticketNumber })) {
      const user = Meteor.users.findOne({ _id: u.userId })
      if (user) {
        if (user.profile.terms === true) {
          console.log(`${user.emails[0].address} flagged for removal`)
          Meteor.users.update(user._id, { $set: { isBanned: true, 'profile.ticketNumber': -1 } })
          Volunteers.Collections.ShiftSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
          Volunteers.Collections.LeadSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
          Volunteers.Collections.ProjectSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
          Volunteers.Collections.TaskSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
        } else {
          console.log(`${user.emails[0].address} Removed`)

          Meteor.users.remove(u.userId)
        }
      }
    }
  })

  NewTickets.remove({})
}
