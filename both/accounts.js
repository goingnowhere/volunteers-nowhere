import { AccountsTemplates } from 'meteor/useraccounts:core'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import i18n from 'meteor/universe:i18n'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from './init'

AccountsTemplates.configure({
  defaultLayout: 'homeLayout',
  enablePasswordChange: true,
  showForgotPasswordLink: true,
  sendVerificationEmail: true,
  continuousValidation: true,
  // enforceEmailVerification: true,
  // privacyUrl: '/s/privacy',
  // forbidClientAccountCreation: true,
  // showResendVerificationEmailLink: true,
  // postSignUpHook,
  // onLogoutHook: onSignOut,
  // termsUrl: 'terms-of-use',
  onLogoutHook() {
    Meteor.setTimeout(() => {
      if (!Meteor.user()) {
        Router.go('homePage')
      }
    }, 100)
  },
})

AccountsTemplates.addField({
  _id: 'language',
  type: 'select',
  displayName: 'Language',
  select: [
    { text: 'en', value: 'en' },
    { text: 'fr', value: 'fr' },
    { text: 'es', value: 'es' },
  ],
})

AccountsTemplates.addField({
  _id: 'terms',
  type: 'checkbox',
  template: 'termsCheckbox',
  errStr: 'You must agree to the Terms and Conditions',
  func: value => !value,
  negativeValidation: false,
})

// Add terms and language fields at enrollment.
// at startup to be executed after initialization
Meteor.startup(() => {
  const fields = AccountsTemplates.getFields()
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    if ((field._id === 'terms') || (field._id === 'language')) {
      // Enable it for any other states you want
      field.visible = ['signUp', 'atEnrollAccount', 'enrollAccount']
    }
  }
})

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    user.profile = options.profile
    user.profile.ticketNumber = 'Manual registration'
    return user
  })
}

this.setUserLanguage = (userId) => {
  const user = Meteor.users.findOne(userId)
  if (user) {
    // T9n.setLanguage(user.profile.language)
    i18n.setLocale(user.profile.language)
    moment.locale(user.profile.language)
  }
}

// const addUsersToRoles = (userId) => {
// this can be useful
// if (Meteor.users.find().count() === 1) {
//   Roles.addUsersToRoles(userId, 'super-admin')
// }
// }

const postSignUpHook = (userId) => { // eslint-disable-line no-unused-vars
  if (Meteor.isServer) {
    Roles.addUsersToRoles(userId, 'user', Volunteers.eventName)
  }
  if (Meteor.isClient) {
    this.setUserLanguage(userId)
  }
}

Accounts.onLogin(function onLogin() {
  if (Meteor.isClient) {
    this.setUserLanguage(Meteor.userId())
  }
})
