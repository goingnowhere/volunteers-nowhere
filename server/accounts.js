import { Accounts } from 'meteor/accounts-base'
import { HTTP } from 'meteor/http'

import { MeteorProfile } from '../both/init'
import {
  isManagerMixin,
  ValidatedMethodWithMixin,
  isNoInfoMixin,
  isSameUserOrNoInfoMixin,
} from '../both/authMixins'
import { config } from './config'

const quicketTest = Meteor.isDevelopment && !config.quicketApiKey
  && !config.quicketEventId && !config.quicketUserToken

// const extractAnswers = ({ questionAnswers }) => {

// }

Accounts.onCreateUser((options, user) => {
  const { email } = options
  let quicket
  if (!quicketTest) {
    const { data: { results } } = HTTP.call('GET', `https://api.quicket.co.za/api/events/${config.quicketEventId}/registrations`, {
      query: `search=${email}`,
      headers: {
        api_key: config.quicketApiKey,
        usertoken: config.quicketUserToken,
        pageSize: 10,
        page: 1,
        seasortByrch: 'DateAdded',
        sortDirection: 'DESC',
      },
    })
    if (results.length !== 1 || results[0].email !== email) {
      if (email.match(/@goingnowhere.org$/)) {
        quicket = {
          shadowyCabal: true,
          email,
        }
      } else {
        throw new Meteor.Error(404, 'Bio for that email does not exist. Try making one?')
      }
    } else {
      [quicket] = results
    }
  } else {
    quicket = {
      fake: true,
      registrationId: 90319,
      userId: 937853,
      email,
    }
  }
  return {
    ...user,
    profile: {}, // extractAnswers(quicket),
    quicket,
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
