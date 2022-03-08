import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { fetch } from 'meteor/fetch'
import { wrapAsync } from 'meteor/goingnowhere:volunteers'
import { ticketsCollection } from '../both/collections/users'
import { config } from './config'

const prepTicketData = (guest) => {
  const ticketInfo = guest.TicketInformation
  return {
    _id: guest.TicketId,
    barcode: guest.Barcode,
    email: ticketInfo.Email.toLowerCase(),
    firstName: ticketInfo['First name'],
    lastName: ticketInfo.Surname,
    nickname: ticketInfo['What is your playa name (if you have one)?'],
    rawGuestInfo: guest,
  }
}

export const syncQuicketTicketList = () => {
  const { statusCode, data: { results, pages } } = HTTP.call('GET', `https://api.quicket.co.za/api/events/${config.quicketEventId}/guests`, {
    headers: {
      api_key: config.quicketApiKey,
      usertoken: config.quicketUserToken,
      pageSize: 10,
      page: 1,
      seasortByrch: 'DateAdded',
      sortDirection: 'DESC',
    },
  })
  if (statusCode !== 200) throw new Meteor.Error(500, 'Problem calling Quicket')
  if (pages !== 0) throw new Meteor.Error(501, 'Need to implement pagination')

  const guestsByTicketId = _.indexBy(results, 'TicketId')
  const guestsByEmail = _.indexBy(results, (res) => res.TicketInformation.Email.toLowerCase())

  // Find users without tickets and try to match them to guests
  // eslint-disable-next-line array-callback-return
  Meteor.users.find({ ticketId: { $exists: false } }).map((user) => {
    const userEmailIndex = user.emails.findIndex((email) => guestsByEmail[email.address])
    if (userEmailIndex > -1) {
      const guest = guestsByEmail[user.emails[userEmailIndex].address]
      Meteor.users.update({ _id: user._id }, {
        $set: {
          ticketId: guest.TicketId,
        },
      })
    }
  })

  const ticketChanges = ticketsCollection.find({}, {
    fields: {
      barcode: true,
      email: true,
      rawGuestInfo: true,
    },
  }).map((ticket) => {
    const guest = guestsByTicketId[ticket._id]
    if (!guest) {
      // There's nobody on the guestlist for this ticket id so it must have been transfered, etc
      ticketsCollection.remove({ _id: ticket._id })
      return null
    }
    const guestEmail = guest.TicketInformation.Email.toLowerCase()
    if (guestEmail !== ticket.email) {
      // The email address on the ticket has changed so update our record
      delete guestsByTicketId[ticket._id]
      return prepTicketData(guest)
    }
    if (!ticket.rawGuestInfo) {
      // We don't have rawGuestInfo stored so add it
      delete guestsByTicketId[ticket._id]
      return {
        _id: guest.TicketId,
        $set: {
          rawGuestInfo: guest,
        },
      }
    }
    if (ticket.barcode === guest.Barcode) {
      // Our copy of the ticket matches so we don't need to update anything
      delete guestsByTicketId[ticket._id]
    }
    return null
  }).filter((ticket) => ticket)
  ticketChanges.concat(
    Object.keys(guestsByTicketId).map((ticketId) => prepTicketData(guestsByTicketId[ticketId])),
  ).forEach(({ _id, ...update }) => {
    ticketsCollection.upsert({ _id }, update)
  })
}

export const lookupUserTicket = wrapAsync(async ({ email, ticketId }) => {
  const lookup = ticketId ? `QTK${ticketId}` : email
  const response = await fetch(`${config.noonerHuntApi}?key=${config.noonerHuntKey}&nooner=${lookup}`, {
    method: 'GET',
  })
  if (!response.ok) {
    if (response.status >= 500) {
      console.error('Error retrieving ticket', response)
      throw new Meteor.Error(500, 'Problem calling ticket API')
    } else {
      console.log('Failed to find ticket', response.status, lookup)
      return false
    }
  } else {
    const tickets = await response.json()
    if (tickets.length >= 1) {
      if (tickets.length > 1) {
        console.error('Got more than one ticket', lookup, tickets)
      }
      return tickets[0]
    }
    return false
  }
})
