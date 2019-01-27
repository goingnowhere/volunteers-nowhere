import { Accounts } from 'meteor/accounts-base'
import { setUserLocale } from './locale'

Accounts.config({
  passwordEnrollTokenExpirationInDays: 60,
})

Accounts.ui.config({
  passwordSignupFields: 'EMAIL_ONLY',
  minimumPasswordLength: 6,
  // requireEmailVerification
  homeRoutePath: '/',
  profilePath: '/dashboard',
  loginPath: '/login',
  signUpPath: '/signup',
  resetPasswordPath: '/password-reset',
  changePasswordPath: '/password',
  // FIXME Forces page to reload. Either add <Redirect> route or mod accounts-ui
  onSignedInHook: () => { window.location.href = '/dashboard' },
})

Accounts.onLogin(() => {
  if (Meteor.isClient) {
    setUserLocale(Meteor.userId())
  }
  // TODO Not sure why the below was put in - Rich
  // if (Meteor.isServer) {
  //   const user = Meteor.user()

  //   // after the enrollment this address is not needed anymore
  //   if (user.emails && (user.emails[0].address.indexOf('@email.invalid') > 0)) {
  //     Meteor.users.update({ _id: user._id }, { $set: { emails: [] } })
  //   }
  // }
})


if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    user.profile = options.profile
    user.profile.ticketDate = new Date()
    user.profile.ticketNumber = 0
    user.profile.manualRegistration = true
    user.profile.invitationSent = false
    return user
  })

  Accounts.validateLoginAttempt((info) => {
    const { user } = info
    if (user) {
      const hasIsBannedProperty = Object.prototype.hasOwnProperty.call(user, 'isBanned')
      if (hasIsBannedProperty && user.isBanned) {
        throw new Meteor.Error(403, 'You are banned')
      }
      return true
    } return false
  })
}
