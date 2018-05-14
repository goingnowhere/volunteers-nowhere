import { MeteorProfile } from '../both/init'

import {
  isManagerMixin,
  ValidatedMethodWithMixin,
  isLoggedInMixin,
  isNoInfoInMixin,
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
    [isNoInfoInMixin], // Manager and noInfo leads
  )
