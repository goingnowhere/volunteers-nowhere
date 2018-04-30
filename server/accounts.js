import {
  MeteorProfile,
  isManagerMixin,
  ValidatedMethodWithMixin,
  isLoggedInMixin,
} from '../both/init'

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

export const userProfileSendEnrollAccount =
  ValidatedMethodWithMixin(
    MeteorProfile.Methods.userProfileSendEnrollAccount,
    [isManagerMixin],
  )
