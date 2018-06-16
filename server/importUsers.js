import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'
import { Volunteers } from '../both/init'
import SimpleSchema from 'simpl-schema'

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
const pendingUsersSchema = new SimpleSchema({
  TicketId: Number,
  Email: String,
  DateAdded: Date,
  FirstName: {
    type: String,
    optional: true,
  },
  LastName: {
    type: String,
    optional: true,
  },
})
pendingUsers.attachSchema(pendingUsersSchema)

/*  Add the user to a collection */
const addUserToPending = (user) => {
  pendingUsers.upsert({ TicketId: user.TicketId }, { $set: user })
}

export const Tickets = new Mongo.Collection('tickets')
Tickets.attachSchema(new SimpleSchema({ userId: String, email: String, ticketNumber: Number }))
const NewTickets = new Mongo.Collection('newTickets')
NewTickets.attachSchema(pendingUsersSchema)

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
        /*  this user managed to remove its email. putting it back */
        if (userExists.emails.length === 0) {
          console.log('Fix user: Update Email', user.Email)
          Meteor.users.update({ _id: userExists._id }, {
            $set: {
              $push: { emails: { address: user.Email, verified: true } },
              'profile.ticketNumber': Number(user.TicketId),
            },
          })
          Tickets.update(
            { _id: userExists._id },
            { $set: { ticketNumber: Number(user.TicketId), email: user.Email } },
          )
        }
        // the user exists and it's a snowflake
        if (Number(userExists.profile.ticketNumber) === 0) {
          console.log('Update existing', userExists.emails[0].address)
          Meteor.users.update({ _id: userExists._id }, {
            $set: {
              'profile.ticketNumber': Number(user.TicketId),
              'profile.ticketDate': new Date(user.DateAdded),
              'profile.manualRegistration': false,
              'emails.0.verified': true,
            },
          })
        } else if (Number(userExists.profile.ticketNumber) === -1) {
          console.log('Fix user', user.Email)
          Meteor.users.update({ _id: userExists._id }, {
            $set: {
              $push: { emails: { address: user.Email, verified: true } },
              'profile.ticketNumber': Number(user.TicketId),
            },
          })
          Tickets.update(
            { _id: userExists._id },
            { $set: { ticketNumber: Number(user.TicketId), email: user.Email } },
          )
        } else if (Number(userExists.profile.ticketNumber) !== Number(user.TicketId)) {
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
        const userExistsByticketId = Meteor.users.findOne({ 'profile.ticketNumber': Number(user.TicketId) })
        if (userExistsByticketId) {
          if (userExistsByticketId.emails.length === 0) {
            console.log('Fix user: Update Email / found by ticketId', user.Email, user.TicketId)
            Meteor.users.update({ 'profile.ticketNumber': Number(user.TicketId) }, {
              $set: {
                $push: { emails: { address: user.Email, verified: true } },
                'profile.ticketNumber': Number(user.TicketId),
              },

            })
          }
        } else {
          // ticket does not exists and user does not exists : we create the user
          const userId = addUser(user)
          console.log(`Create User ${userId}`, user.Email)
          Tickets.insert({ userId, ticketNumber: Number(user.TicketId), email: user.Email })
        }
      }
    } else {
      const userExists = Accounts.findUserByEmail(user.Email)
      if (userExists) {
        if (userExists.profile.ticketNumber === -1) {
          console.log('Fix user: Update ticketId / found by email', user.Email, user.TicketId)
          Meteor.users.update({ 'profile.ticketNumber': Number(user.TicketId) }, {
            $set: {
              $push: { emails: { address: user.Email, verified: true } },
              'profile.ticketNumber': Number(user.TicketId),
            },
          })
          Tickets.update(
            { _id: userExists._id },
            { $set: { ticketNumber: Number(user.TicketId), email: user.Email } },
          )
        }
      }
      const userExistsByticketId = Meteor.users.findOne({ 'profile.ticketNumber': Number(user.TicketId) })
      if (userExistsByticketId) {
        if (userExistsByticketId.emails.length === 0) {
          console.log('Fix user : Update Email / found by ticketId', user.Email, user.TicketId)
          Meteor.users.update({ 'profile.ticketNumber': Number(user.TicketId) }, {
            $set: {
              $push: { emails: { address: user.Email, verified: true } },
              'profile.ticketNumber': Number(user.TicketId),
            },
          })
          Tickets.update(
            { _id: userExistsByticketId._id },
            { $set: { ticketNumber: Number(user.TicketId), email: user.Email } },
          )
        }
      }
    }
    // we ship this user
    return null
  })
  /* Tickets.find().forEach((u) => {
    if (!NewTickets.findOne({ TicketId: Number(u.ticketNumber) })) {
      const user = Meteor.users.findOne({ _id: u.userId })
      if (user) {
        console.log(u)

        if (user.profile.terms === true) {
          if (user.emails.length > 0) {
            console.log(`${user.emails[0].address} flagged for removal`)
            console.log(user)
            Meteor.users.update(user._id, { $set: { isBanned: true, 'profile.ticketNumber': -1 } })
            Volunteers.Collections.ShiftSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
            Volunteers.Collections.LeadSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
            Volunteers.Collections.ProjectSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
            Volunteers.Collections.TaskSignups.update({ userId: user._id }, { $set: { status: 'cancelled' } })
          }
        } else {
          console.log(`${user.emails[0].address} Removed`)
          Meteor.users.remove(u.userId)
        }
      }
    }
  }) */

  NewTickets.remove({})
}
