import { MeteorProfile } from '../both/init'

import {
  isManagerMixin,
  ValidatedMethodWithMixin,
  isLoggedInMixin,
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
    [isLoggedInMixin],
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
    [isLoggedInMixin, isSameUserOrNoInfoMixin],
  )

export const userMakeEmailPrimary =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userMakeEmailPrimary,
    [isLoggedInMixin, isSameUserOrNoInfoMixin],
  )

export const userRemoveEmail =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userRemoveEmail,
    [isLoggedInMixin, isSameUserOrNoInfoMixin],
  )
