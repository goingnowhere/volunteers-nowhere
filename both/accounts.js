import { AccountsTemplates } from 'meteor/useraccounts:core'
import { Accounts } from 'meteor/accounts-base'
import i18n from 'meteor/universe:i18n'
import { moment } from 'meteor/momentjs:moment'

Accounts.config({
  passwordEnrollTokenExpirationInDays: 60,
})

AccountsTemplates.configure({
  defaultLayout: 'homeLayout',
  enablePasswordChange: true,
  showForgotPasswordLink: true,
  sendVerificationEmail: true,
  continuousValidation: true,
  enforceEmailVerification: true,
  // privacyUrl: '/s/privacy',
  forbidClientAccountCreation: true,
  showResendVerificationEmailLink: true,
  /* postSignUpHook, */
  // onLogoutHook: onSignOut,
  // termsUrl: 'terms-of-use',
  onSubmitHook: function onSubmitHook(err, state) {
    // we manually set additional fields we collect on enrollment
    if (state === 'enrollAccount') {
      const { nickname, terms, language } = Session.get('enrollAccountCustomFields')
      Meteor.call('Accounts.UpdateUser', {
        _id: Meteor.userId(),
        modifier: {
          $set: {
            'profile.nickname': nickname,
            'profile.terms': terms,
            'profile.language': language,
          },
        },
      })
    }
  },
  onLogoutHook() {
    Meteor.setTimeout(() => {
      if (!Meteor.user()) {
        Router.go('homePage')
      }
    }, 100)
  },
})

AccountsTemplates.addField({
  _id: 'nickname',
  type: 'text',
  displayName: 'Playa Name/FoD Name/Nickname',
  placeholder: 'Field of Dirt Name',
  required: true,
  errStr: 'We need to know what to call you',
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
  required: true,
  template: 'termsCheckbox',
  errStr: 'You must agree to the Terms and Conditions',
  func: value => !value,
  negativeValidation: false,
})

if (Meteor.isClient) {
  Template.atPwdForm.events({
    submit: function sub(event, template) {
      const nickname = template.$('#at-field-nickname').val()
      const language = template.$('#at-field-language').val()
      const terms = template.$('#at-field-terms').is(':checked')
      if (nickname && language && terms) {
        Session.set('enrollAccountCustomFields', { nickname, terms, language })
      }
    },
  })
}

// Add terms and language fields at enrollment.
// at startup to be executed after initialization
Meteor.startup(() => {
  const fields = AccountsTemplates.getFields()
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i]
    if ((field._id === 'terms') ||
        (field._id === 'language') ||
        field._id === 'nickname') {
      field.visible = ['signUp', 'atEnrollAccount', 'enrollAccount']
    }
  }
})

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


Accounts.onLogin(function onLogin() {
  if (Meteor.isClient) {
    this.setUserLanguage(Meteor.userId())
  }
  if (Meteor.isServer) {
    const user = Meteor.user()
    // after the enrollment this address is not needed anymore
    if (user.emails && (user.emails[0].address.indexOf('@email.invalid') > 0)) {
      Meteor.users.update({ _id: user._id }, { $set: { emails: [] } })
    }
  }
})


if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    user.profile = options.profile
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
