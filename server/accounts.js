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

moment.tz.setDefault('Europe/Paris')

Accounts.onCreateUser((options, user) => {
  const { email } = options
  let ticketId
  let profile
  if (Meteor.isProduction) {
    const { fistOpenDate } = EventSettings.findOne()
    // Temporarily only allow @gn signups
    if (moment(fistOpenDate).isAfter() && !/@goingnowhere.org$/.test(email)) {
      throw new Meteor.Error(401, `You can't sign up yet, come back on ${moment(fistOpenDate).format('Do MMMM')}`)
    }
    const ticket = ticketsCollection.findOne({ email })
    if (!ticket) {
      const match = /([^@\s]+)@goingnowhere.org$/.exec(email)
      if (match && match[1]) {
        profile = { firstName: match[1] }
      } else {
        throw new Meteor.Error(404, 'You need a ticket to sign up. Please use the email your ticket is assigned to')
      }
    } else {
      ticketId = ticket._id
      profile = {
        firstName: ticket.firstName,
        lastName: ticket.lastName,
        nickname: ticket.nickname,
      }
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
