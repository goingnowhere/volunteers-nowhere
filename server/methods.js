import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import SimpleSchema from 'simpl-schema'
import { Promise } from 'meteor/promise'
import { Volunteers } from '../both/init'
import { getContext, WrapEmailSend } from './email'
import {
  isManagerMixin,
  isNoInfoMixin,
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
    [isNoInfoMixin],
  )

export const sendNotificationEmailFunction = (userId) => {
  if (userId) {
    const user = Meteor.users.findOne(userId)
    const sel = { enrolled: true, notification: false, userId }
    const shiftSignups = Volunteers.Collections.ShiftSignups.find(sel).map(s => _.extend(s, { type: 'shift' }))
    const leadSignups = Volunteers.Collections.LeadSignups.find(sel).map(s => _.extend(s, { type: 'lead' }))
    const projectSignups = Volunteers.Collections.ProjectSignups.find(sel).map(s => _.extend(s, { type: 'project' }))
    const allSignups = shiftSignups.concat(leadSignups).concat(projectSignups)

    if (user && (allSignups.length > 0)) {
      const doc = EmailForms.previewTemplate('voluntell', user, getContext)
      allSignups.forEach((signup) => {
        const modifier = { $set: { notification: true } }
        switch (signup.type) {
          case 'shift':
            Volunteers.Collections.ShiftSignups.update(signup._id, modifier)
            break
          case 'project':
            Volunteers.Collections.ProjectSignups.update(signup._id, modifier)
            break
          case 'lead':
            Volunteers.Collections.LeadSignups.update(signup._id, modifier)
            break
          default:
        }
      })
      WrapEmailSend(user, doc)
      if (!user.profile.terms) {
        Accounts.sendEnrollmentEmail(userId)
      }
    }
  }
}

const sendNotificationEmailMethod = {
  name: 'email.sendNotifications',
  validate: null,
  run: sendNotificationEmailFunction,
}

export const sendNotificationEmail =
ValidatedMethodWithMixin(
  sendNotificationEmailMethod,
  [isNoInfoMixin],
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
    [isNoInfoMixin],
  )
