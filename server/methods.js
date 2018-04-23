import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { getContext } from './email'
// import { Volunteers } from '../both/init'

const EnrollUserSchema = new SimpleSchema({
  email: String,
  profile: Object,
  'profile.firstName': String,
  'profile.lastName': String,
  'profile.ticketNumber': String,
})

export const enrollUser = new ValidatedMethod({
  name: 'Accounts.enrollUserCustom',
  validate: EnrollUserSchema.validator(),
  run(user) {
    // TODO make it a mixin !
    // if (!Volunteers.isManager()) {
    //   throw new Meteor.Error('403', "You don't have permission for this operation")
    // }
    console.log('Enroll ', user)
    const userId = Accounts.createUser(user)
    Accounts.sendEnrollmentEmail(userId)
  },
})

export const sendWelcomeEmail = new ValidatedMethod({
  name: 'email.sendWelcome',
  validate() { return true },
  run(user) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('unauthorized', "You don't have permission for this operation")
    }
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
})
