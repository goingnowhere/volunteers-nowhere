import { Meteor } from 'meteor/meteor'
import { MongoBackedQueue } from 'meteor/goingnowhere:volunteers'
import { checkForTicketUpdate } from './fistbump'

const ticketCheckQueue = new MongoBackedQueue('ticketCheck')

export function queueTicketChecks(alsoCheckExisting) {
  const query = {
    'profile.formFilled': true,
    ...alsoCheckExisting
      ? {}
      : { $or: [{ ticketId: { $lt: 10000 } }, { ticketId: { $exists: false } }] },
  }
  const users = Meteor.users.find(query, { _id: true }).fetch()
  ticketCheckQueue.addToQueue(users.map(user => user._id))
}

export function processTicketCheckItem() {
  ticketCheckQueue.processItem((userId) => {
    const user = Meteor.users.findOne({ _id: userId })
    const ticket = checkForTicketUpdate(user)
    // TODO? add unique index for ticketId and handle dupes that way?
    if (ticket && (!user.ticketId || user.ticketId !== ticket.TicketId)) {
      console.log(`Updating ${user._id} to have ticket ${ticket.TicketId} from ${user.ticketId}`, user.emails)
      Meteor.users.update({ _id: user._id },
        { $set: { ticketId: ticket.TicketId, rawTicketInfo: ticket } })
    } else if (!ticket && user.ticketId) {
      console.log(`Removing invalid ticket ${user.ticketId} from user ${user._id}`)
      Meteor.users.update({ _id: user._id }, { $unset: { ticketId: '', rawTicketInfo: '' } })
    }
  })
}
