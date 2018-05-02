import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { getContext } from './email'
import { isManagerMixin, isNoInfoInMixin, ValidatedMethodWithMixin } from '../both/init'

const EnrollUserSchema = new SimpleSchema({
  email: String,
  profile: Object,
  'profile.firstName': String,
  'profile.lastName': String,
  'profile.ticketNumber': String,
})

export const enrollUserMethod = {
  name: 'Accounts.enrollUserCustom',
  validate: EnrollUserSchema.validator(),
  run(user) {
    const userId = Accounts.createUser(user)
    Accounts.sendEnrollmentEmail(userId)
  },
}

// create a new user and send an enrollment message
export const enrollUser =
  ValidatedMethodWithMixin(
    enrollUserMethod,
    [isManagerMixin],
  )

const ChangePasswordSchema = new SimpleSchema({
  userId: String,
  password: String,
  password_again: String,
})

export const adminChangeUserPasswordMethod = {
  name: 'Accounts.adminChangeUserPassword',
  validate: ChangePasswordSchema.validator(),
  run(doc) {
    if (doc.password === doc.password_again) {
      Accounts.setPassword(doc.userId, doc.password)
    } else {
      throw new Meteor.Error('userError', "Passwords don't match")
    }
  },
}

export const adminChangeUserPassword =
  ValidatedMethodWithMixin(
    adminChangeUserPasswordMethod,
    [isNoInfoInMixin],
  )

export const sendWelcomeEmailMethod = {
  name: 'email.sendWelcome',
  validate() { return true },
  run(user) {
    const doc = EmailForms.previewTemplate('welcomeEmail', user, getContext)
    if (doc) {
      Email.send(doc, (err) => {
        if (!err) {
          EmailLogs.insert({
            userId: user._id,
            template: doc.templateId,
            sent: Date(),
          })
        }
      })
    }
  },
}

export const sendWelcomeEmail =
  ValidatedMethodWithMixin(
    sendWelcomeEmailMethod,
    [isManagerMixin],
  )
