import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { setUserLocale } from './locale'

export const MIN_PWD_LENGTH = 6

Accounts.config({
  sendVerificationEmail: true,
  passwordEnrollTokenExpirationInDays: 60,
})

Accounts.ui.config({
  passwordSignupFields: 'EMAIL_ONLY',
  minimumPasswordLength: MIN_PWD_LENGTH,
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
  emailPattern: /[^@]+@[A-Za-z0-9-]{1,63}\.[A-Za-z0-9-]+/,
})

Accounts.onLogin(() => {
  if (Meteor.isClient) {
    setUserLocale(Meteor.userId())
  }
})
