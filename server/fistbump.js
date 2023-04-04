import { fetch } from 'meteor/fetch'
import { wrapAsync } from 'meteor/goingnowhere:volunteers'
import { config } from './config'

/** FistBump gives us a fake ticketId if they don't have one from Quicket and the number is always
  * less than a real ticket, so take the highest ticket id */
function pickBestTicket(tickets) {
  let ticket = tickets[0]
  tickets.forEach((tick) => {
    if (tick.TicketId > ticket.TicketId) {
      ticket = tick
    }
  })
  return ticket
}

export const lookupUserTicket = wrapAsync(async ({ email, ticketId }) => {
  const lookup = ticketId ? `QTK${ticketId}` : email
  const response = await fetch(`${config.noonerHuntApi}?key=${config.noonerHuntKey}&nooner=${lookup}`, {
    method: 'GET',
  })
  if (!response.ok) {
    if (response.status >= 500) {
      console.error('Error retrieving ticket', response)
      // We no longer need to error out on this as a ticket isn't required up-front
      // throw new Meteor.Error(500, 'Problem calling ticket API')
    } else {
      console.log('Failed to find ticket', response.status, lookup)
    }
    return false
  }
  const tickets = await response.json()
  if (tickets.length >= 1) {
    return pickBestTicket(tickets)
  }

  return false
})

export function checkForTicketUpdate(user) {
  let ticket = false
  if (user.ticketId) {
    ticket = lookupUserTicket({ ticketId: user.ticketId })
    if (ticket) {
      return ticket
    }
    // else check by email for ticket
  }
  const tickets = user.emails
    .filter(({ verified }) => verified)
    .map(({ address }) => lookupUserTicket({ email: address }))
    .filter(Boolean)
  // Just in case they have tickets for multiple emails
  ticket = pickBestTicket(tickets)

  return ticket
}
