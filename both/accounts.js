import { Meteor } from 'meteor/meteor'
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
  onEnrollAccountHook: '/',
  onSignedInHook: '/dashboard',
  onVerifyEmailHook: '/profile',
  onResetPasswordHook: '/password',
})

Accounts.onLogin(() => {
  if (Meteor.isClient) {
    setUserLocale(Meteor.userId())
  }
})
