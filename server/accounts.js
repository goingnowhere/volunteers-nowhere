import { MeteorProfile } from '../both/init'

import {
  isManagerMixin,
  ValidatedMethodWithMixin,
  isNoInfoMixin,
  isSameUserOrNoInfoMixin,
} from '../both/authMixins'

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
