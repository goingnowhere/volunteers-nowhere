import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import moment from 'moment-timezone'

import { MeteorProfile } from '../both/init'
import {
  isManagerMixin,
  ValidatedMethodWithMixin,
  isNoInfoMixin,
  isSameUserOrNoInfoMixin,
} from '../both/authMixins'
import { ticketsCollection } from '../both/collections/users'
import { EventSettings } from '../both/collections/settings'

import { devConfig } from './config'
import { lookupUserTicket } from './quicket'

Accounts.onCreateUser((options, user) => {
  const email = options.email.toLowerCase()
  let ticketId
  let profile = options.language ? { language: options.language } : {}
  let ticket
  if (Meteor.isProduction || devConfig.testTicketApi) {
    const { fistOpenDate } = EventSettings.findOne() || {}
    // Temporarily only allow @gn signups
    if (moment(fistOpenDate).isAfter() && !/@goingnowhere.org$/.test(email)) {
      throw new Meteor.Error(401, `You can't sign up yet, come back on ${moment(fistOpenDate).format('Do MMMM')}`)
    }
    ticket = lookupUserTicket(email)
    if (ticket) {
      ticketId = ticket.TicketId
    }
    const match = /([^@\s]+)@goingnowhere.org$/.exec(email)
    if (match && match[1]) {
      profile = { nickname: match[1] }
    }
  } else {
    profile = {
      firstName: 'Test',
    }
  }
  return {
    ...user,
    ticketId,
    profile,
    rawTicketInfo: ticket,
  }
})

Accounts.validateLoginAttempt((info) => {
  const { user } = info
  if (user) {
    if (user.isBanned) {
      throw new Meteor.Error(403, 'You are banned')
    }
    return true
  } return false
})

// TODO I don't think these are used any more
export const userProfileRemoveUser =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userProfileRemoveUser,
    [isManagerMixin],
  )

export const userProfileUpdateUser =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userProfileUpdateUser,
    [isSameUserOrNoInfoMixin],
  )

// Just send an enrollment message to the user
export const userProfileSendEnrollAccount =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userProfileSendEnrollAccount,
    [isNoInfoMixin], // Manager and noInfo leads
  )

export const userProfileAddEmail =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userAddEmail,
    [isSameUserOrNoInfoMixin],
  )

export const userMakeEmailPrimary =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userMakeEmailPrimary,
    [isSameUserOrNoInfoMixin],
  )

export const sendVerificationEmail =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.sendVerificationEmail,
    [isSameUserOrNoInfoMixin],
  )

export const userRemoveEmail =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userRemoveEmail,
    [isSameUserOrNoInfoMixin],
  )
