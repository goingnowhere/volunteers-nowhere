import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
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
  console.log('syncing')
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
  // const guestsByTicketId = results.reduce((map, guest) =>
  // map.set(guest.TicketId, guest), new Map()), 'TicketId')
  const guestsByTicketId = _.indexBy(results, 'TicketId')
  const ticketChanges = ticketsCollection.find({}, {
    barcode: true,
    email: true,
  }).map((ticket) => {
    const guest = guestsByTicketId[ticket._id]
    if (!guest) {
      ticketsCollection.remove({ _id: ticket._id })
      return null
    }
    const guestEmail = guest.TicketInformation.Email.toLowerCase()
    if (guestEmail !== ticket.email) {
      delete guestsByTicketId[ticket._id]
      return prepTicketData(guest)
    }
    if (!guest.TicketInformation.rawGuestInfo) {
      delete guestsByTicketId[ticket._id]
      return {
        _id: guest.TicketId,
        $set: {
          rawGuestInfo: guest,
        },
      }
    }
    return null
  }).filter(ticket => ticket)
  ticketChanges.concat(
    Object.keys(guestsByTicketId).map(ticketId => prepTicketData(guestsByTicketId[ticketId])),
  ).forEach(({ _id, ...update }) => {
    ticketsCollection.upsert({ _id }, update)
  })
}
