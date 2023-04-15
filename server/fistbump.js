import { Meteor } from 'meteor/meteor'
import { fetch } from 'meteor/fetch'
import { wrapAsync } from 'meteor/goingnowhere:volunteers'
import { config } from './config'

function pickBestTicket(tickets, { email, ticketId }) {
  if (ticketId) {
    return tickets.find(tick => tick.TicketId === ticketId) || tickets[0]
  }
  return tickets.find(tick => tick.Email === email) || tickets[0]
}

export const lookupUserTicket = wrapAsync(async ({ email, ticketId }) => {
  const lookup = ticketId ? `QTK${ticketId}` : email
  const response = await fetch(`${config.noonerHuntApi}/huntthenooner?key=${config.noonerHuntKey}&nooner=${lookup}`, {
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
    return -1
  }
  const tickets = await response.json()
  if (tickets.length >= 1) {
    return pickBestTicket(tickets, { email, ticketId })
  }

  return 0
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
  // First ticket could be -1 if there's an error but we should handle that by not changing anything
  return tickets[0] || 0
}

async function checkHash(hash) {
  const response = await fetch(`${config.noonerHuntApi}/verify?key=${config.noonerHuntKey}&v=${hash}`, {
    method: 'GET',
  })
  if (!response.ok) {
    if (response.status >= 500) {
      console.error('Error checking Fistbump hash', response)
      throw new Meteor.Error(500, 'Problem calling ticket API')
    } else {
      console.log('Failed to find nobody', response.status, hash)
      return false
    }
  }
  const ticketDetails = await response.json()
  if (ticketDetails.length >= 1) {
    const raw = ticketDetails[0]
    return { email: raw.Email, ticketId: raw.TicketId, raw }
  }
  return false
}

export function serverCheckHash({ hash }) {
  if (!hash) {
    throw new Meteor.Error(400, 'This link is invalid')
  }
  let checkResult
  try {
    checkResult = wrapAsync(checkHash)(hash)
  } catch (err) {
    throw new Meteor.Error(500, 'There was an error on the server, if this persists, contact fist@goingnowhere.org')
  }
  if (!checkResult) {
    throw new Meteor.Error(400, 'Invalid log in link, please check your email')
  }
  return checkResult
}
