import { Accounts } from 'meteor/accounts-base'
import { setUserLocale } from './locale'

Accounts.config({
  sendVerificationEmail: true,
  passwordEnrollTokenExpirationInDays: 60,
})

Accounts.ui.config({
  passwordSignupFields: 'EMAIL_ONLY',
  minimumPasswordLength: 6,
  // requireEmailVerification: true,
  homeRoutePath: '/',
  profilePath: '/dashboard',
  loginPath: '/login',
  signUpPath: '/signup',
  resetPasswordPath: '/password-reset',
  changePasswordPath: '/password',
  // FIXME Forces page to reload. Either add <Redirect> route or mod accounts-ui
  onEnrollAccountHook: () => { window.location.href = '/' },
  onSignedInHook: () => { window.location.href = '/dashboard' },
  onVerifyEmailHook: () => { window.location.href = '/profile' },
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
