import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { Email } from 'meteor/email'
import { Volunteers } from '../both/init'
import { getContext } from './email'
import {
  isManagerMixin,
  isNoInfoInMixin,
  ValidatedMethodWithMixin,
} from '../both/authMixins'

const EnrollUserSchema = new SimpleSchema({
  email: String,
  profile: Object,
  'profile.firstName': String,
  'profile.lastName': String,
  'profile.ticketNumber': String,
})

const enrollUserMethod = {
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

const adminChangeUserPasswordMethod = {
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

export const EmailLogs = new Mongo.Collection('emailLogs')

const sendWelcomeEmailMethod = {
  name: 'email.sendWelcome',
  validate: null,
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

const userStatsMethod = {
  name: 'users.stats',
  validate: null,
  run() {
    const ticketHolders = Meteor.users.find({ 'profile.ticketNumber': { $ne: 'Manual registration' } }).count()
    const enrollmentSent = 0
    const enrolled = Meteor.users.find({
      $and: [
        { 'profile.ticketNumber': { $ne: 'Manual Registration' } },
        { 'profile.terms': true },
      ],
    }).count()
    const profileFilled = Volunteers.Collections.VolunteerForm.find().count()
    const withDuties = Promise.await(Volunteers.Collections.ShiftSignups.rawCollection().distinct('userId'))
    return {
      ticketHolders,
      enrollmentSent,
      enrolled,
      profileFilled,
      withDuties: withDuties.length,
    }
  },
}

export const userStats =
  ValidatedMethodWithMixin(
    userStatsMethod,
    [isNoInfoInMixin],
  )
