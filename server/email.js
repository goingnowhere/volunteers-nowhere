import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { EmailForms } from 'meteor/abate:email-forms'
import { Accounts } from 'meteor/accounts-base'
import { Email } from 'meteor/email'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { check } from 'meteor/check'
import { Promise } from 'meteor/promise'
import moment from 'moment-timezone'

import { Volunteers } from '../both/init'
import './accounts'
import {
  isManagerMixin,
} from '../both/authMixins'
import { EventSettings } from '../both/collections/settings'

const EmailCache = new Mongo.Collection('emailCache')
const EmailLogs = new Mongo.Collection('emailLogs')
const EmailFails = new Mongo.Collection('emailFails')

const sendEmail = ({
  _id,
  email,
  userId,
  retries,
}) => {
  if (email) {
    try {
      Email.send(email)
      EmailLogs.insert({
        userId,
        template: email.templateId,
        sent: new Date(),
        retries,
      })
      EmailCache.remove({ _id })
    } catch (error) {
      console.error('Error sending mail', error)
      if (retries < 5) {
        EmailCache.update({ _id }, { $inc: { retries: 1 } })
      } else {
        EmailFails.insert({
          email,
          userId,
          retries,
          errorName: error.name,
          errorMsg: error.message,
        })
        EmailCache.remove({ _id })
      }
    }
  }
}

let emailLock = false
export const sendCachedEmails = () => {
  // A bit ugly but prevent this function running twice at a time, e.g. through the cron trigger
  if (!emailLock) {
    emailLock = true
    EmailCache.find({}, {
      sort: { added: 1 },
      limit: 150,
    }).map(sendEmail)
    emailLock = false
  }
}

const WrapEmailSend = (user, email, isBulk, sendArgs) => {
  if (email) {
    EmailCache.insert({
      userId: user._id,
      email,
      retries: 0,
      added: new Date(),
      sendArgs,
    })
    if (!isBulk) {
      const { emailManualCheck } = EventSettings.findOne() || {}
      if (!emailManualCheck) {
        sendCachedEmails()
      }
    }
  }
}

/* Here we add application specific contexts for the emails-forms package */
const getContext = (cntxlist, user, context = {}) => {
  if (!user) { return context }
  cntxlist.forEach((cntx) => {
    switch (cntx.name) {
    case 'UserTeams': {
      const sel = { userId: user._id, status: { $in: ['confirmed', 'pending', 'refused'] } }
      const signups = Volunteers.Collections.signups.find(sel).fetch()
      const emails = Object.keys(_.groupBy(signups, 'parentId')).map((parentId) => {
        let unit = Volunteers.Collections.Team.findOne(parentId)
        if (!unit) {
          unit = Volunteers.Collections.Department.findOne(parentId)
        }
        if (unit) { return { email: unit.email, name: unit.name } }
        return { name: unit.name }
      })

      if (context[`${cntx.namespace}`]) {
        context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], emails)
      } else {
        context[`${cntx.namespace}`] = emails
      }
      break
    }
    case 'Leads': {
      const sel = { userId: user._id, type: 'lead', status: { $in: ['confirmed', 'pending', 'refused'] } }
      const list = Volunteers.Collections.signups.find(sel)
      const allLeads = list.map((s) => {
        const duty = Volunteers.Collections.Lead.findOne(s.shiftId)
        let unit = Volunteers.Collections.Team.findOne(s.parentId)
        if (!unit) {
          unit = Volunteers.Collections.Department.findOne(s.parentId)
        }
        if (duty && unit) {
          const {
            enrolled, notification, status, reviewed,
          } = s
          return {
            reviewed,
            status,
            enrolled,
            notification,
            title: duty.title,
            teamName: unit.name,
            email: unit.email,
          }
        } return null
      }).filter(Boolean)
      const newLeadEnrollments = allLeads.filter((s) => (
        s.enrolled && (!s.notification) && (s.status === 'confirmed')))
      const newLeadReviews = allLeads.filter((s) => (s.reviewed && (!s.notification)))
      const leads = allLeads.filter((s) => ((s.status === 'confirmed') || (s.status === 'pending')))
      const doc = { leads, newLeadEnrollments, newLeadReviews }
      if (context[`${cntx.namespace}`]) {
        context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], doc)
      } else {
        context[`${cntx.namespace}`] = doc
      }
      break
    }
    case 'Shifts': {
      const sel = { userId: user._id, type: 'shift', status: { $in: ['confirmed', 'pending', 'refused'] } }
      const list = Volunteers.Collections.signups.find(sel)
      const allShifts = list.map((s) => {
        const duty = Volunteers.Collections.TeamShifts.findOne(s.shiftId)
        const team = Volunteers.Collections.Team.findOne(s.parentId)
        /* duty and team should always exists for a signup. If not the GC should
            remove these signups */
        if (duty && team) {
          const {
            enrolled, notification, status, reviewed,
          } = s
          return {
            reviewed,
            status,
            enrolled,
            notification,
            title: duty.title,
            teamName: team.name,
            email: team.email,
            start: moment(duty.start),
            end: moment(duty.end),
          }
        } return null
      }).filter(Boolean)
        .sort((a, b) => (a.start.isBefore(b.start) ? -1 : 1))

      const newShiftEnrollments = allShifts.filter((s) => (
        s.enrolled && (!s.notification) && (s.status === 'confirmed')))
      const newShiftReviews = allShifts.filter((s) => (s.reviewed && (!s.notification)))
      const shifts = allShifts.filter((s) => ((s.status === 'confirmed') || (s.status === 'pending')))
      const doc = { shifts, newShiftEnrollments, newShiftReviews }
      if (context[`${cntx.namespace}`]) {
        context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], doc)
      } else {
        context[`${cntx.namespace}`] = doc
      }
      break
    }
    case 'Projects': {
      const sel = { userId: user._id, type: 'project', status: { $in: ['confirmed', 'pending', 'refused'] } }
      const list = Volunteers.Collections.signups.find(sel, { sort: { start: 1 } })
      const allProjects = list.map((s) => {
        const duty = Volunteers.Collections.Projects.findOne(s.shiftId)
        const team = Volunteers.Collections.Team.findOne(s.parentId)
        if (duty && team) {
          const {
            enrolled, notification, status, reviewed,
          } = s

          return {
            reviewed,
            status,
            enrolled,
            notification,
            title: duty.title,
            teamName: team.name,
            email: team.email,
            start: moment(s.start),
            end: moment(s.end),
          }
        } return null
      }).filter(Boolean)

      const newProjectEnrollments = allProjects.filter((s) => (
        s.enrolled && (!s.notification) && (s.status === 'confirmed')))
      const newProjectReviews = allProjects.filter((s) => (s.reviewed && (!s.notification)))
      const projects = allProjects.filter((s) => ((s.status === 'confirmed') || (s.status === 'pending')))
      const doc = { projects, newProjectEnrollments, newProjectReviews }
      if (context[`${cntx.namespace}`]) {
        context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], doc)
      } else {
        context[`${cntx.namespace}`] = doc
      }
      break
    }
    default:
    }
  })
  return context
}

const sendNotificationEmail = ({
  user,
  userId,
  template,
  selector = {},
  isBulk = false,
}) => {
  const recipient = user || Meteor.users.findOne(userId)
  if (recipient) {
    const sel = {
      ...selector, userId: recipient._id, status: { $in: ['confirmed', 'pending'] },
    }
    if (template === 'reviewed') {
      sel.status.$in.push('refused')
    }
    const signupIds = Volunteers.Collections.signups.find(sel).map((signup) => signup._id)
    if (recipient && (signupIds.length > 0)) {
      const doc = EmailForms.previewTemplate(template, recipient, getContext)
      WrapEmailSend(recipient, doc, isBulk, { userId: recipient._id, template, selector })
      Volunteers.Collections.signups.update({ _id: { $in: signupIds } },
        { $set: { notification: true } }, { multi: true })
    }
  }
}

export const getCachedEmailsMethod = new ValidatedMethod({
  name: 'emailCache.get',
  mixins: [isManagerMixin],
  validate: null,
  run() {
    return EmailCache.find().fetch()
  },
})
export const sendCachedEmailMethod = new ValidatedMethod({
  name: 'emailCache.send',
  mixins: [isManagerMixin],
  validate({ emailId }) {
    check(emailId, String)
  },
  run({ emailId }) {
    return EmailCache.find({ _id: emailId }).map(sendEmail)
  },
})
export const deleteCachedEmailMethod = new ValidatedMethod({
  name: 'emailCache.delete',
  mixins: [isManagerMixin],
  validate({ emailId }) {
    check(emailId, String)
  },
  run({ emailId }) {
    return EmailCache.remove({ _id: emailId })
  },
})
export const reGenerateCachedEmailMethod = new ValidatedMethod({
  name: 'emailCache.reGenerate',
  mixins: [isManagerMixin],
  validate({ emailId }) {
    check(emailId, String)
  },
  run({ emailId }) {
    const old = EmailCache.findOne({ _id: emailId })
    const { userId, template, selector } = old.sendArgs
    sendNotificationEmail({ userId, template, selector })
    return EmailCache.remove({ _id: emailId })
  },
})

export const insertEmailTemplateMethod = new ValidatedMethod({
  mixins: [isManagerMixin],
  ...EmailForms.insertEmailTemplate,
})

export const updateEmailTemplateMethod = new ValidatedMethod({
  mixins: [isManagerMixin],
  ...EmailForms.updateEmailTemplate,
})

export const removeEmailTemplateMethod = new ValidatedMethod({
  mixins: [isManagerMixin],
  ...EmailForms.removeEmailTemplate,
})

// const generateEnrollmentLink = (userId, fakeEmail) => {
//   const { token } = Accounts.generateResetToken(userId, fakeEmail, 'enrollAccount')
//   return Accounts.urls.enrollAccount(token)
// }

export const sendEnrollmentEmail = (userId) =>
  sendNotificationEmail({
    userId,
    template: 'voluntell',
    selector: { enrolled: true },
    isBulk: true,
  })
export const sendReviewEmail = (userId, isBulk = false) =>
  sendNotificationEmail({
    userId,
    template: 'reviewed',
    selector: { reviewed: true },
    isBulk,
  })

export const sendShiftReminderEmail = new ValidatedMethod({
  name: 'email.sendShiftReminder',
  validate(userId) {
    check(userId, String)
  },
  mixins: [isManagerMixin],
  run: (userId) => sendNotificationEmail({ userId, template: 'shiftReminder' }),
})

export const sendMassShiftReminderEmail = new ValidatedMethod({
  name: 'email.sendMassShiftReminder',
  validate: null,
  mixins: [isManagerMixin],
  run() {
    const userIds = Promise.await(Volunteers.Collections.signups.rawCollection().distinct('userId', {
      status: { $in: ['confirmed', 'pending'] },
    }))
    const interval = Meteor.setInterval(() => {
      const userId = userIds.pop()
      sendNotificationEmail({ userId, template: 'shiftReminder', isBulk: true })
      if (userIds.length <= 0) {
        Meteor.clearInterval(interval)
      }
    }, 2000)
  },
})

export const sendReviewNotificationEmail = new ValidatedMethod({
  name: 'email.sendReviewNotifications',
  validate(userId) {
    check(userId, String)
  },
  mixins: [isManagerMixin],
  run: sendReviewEmail,
})


// Defaults
Accounts.emailTemplates.from = 'FIST <fist@goingnowhere.org>'
Accounts.emailTemplates.siteName = 'FIST Nowhere 2020'

Accounts.emailTemplates.enrollAccount.from = () => EmailForms.getFrom('enrollAccount')
Accounts.emailTemplates.enrollAccount.subject = (user) => {
  const doc = EmailForms.previewTemplate('enrollAccount', user, getContext)
  return doc.subject
}
Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  const context = { enrollAccount: { url } }
  const doc = EmailForms.previewTemplate('enrollAccount', user, getContext, context)
  return doc.text
}

Accounts.emailTemplates.verifyEmail.from = () => EmailForms.getFrom('verifyEmail')
Accounts.emailTemplates.verifyEmail.subject = (user) => {
  const doc = EmailForms.previewTemplate('verifyEmail', user, getContext)
  return doc.subject
}

const tmpEmailEn = Accounts.sendEnrollmentEmail
Accounts.sendEnrollmentEmail = (userId) => {
  try {
    tmpEmailEn(userId)
    Meteor.users.update(userId, { $set: { 'profile.invitationSent': true } })
    const template = EmailForms.Collections.EmailTemplate.findOne({ name: 'enrollAccount' })._id
    EmailLogs.insert({
      userId,
      template,
      sent: Date(),
    })
  } catch (error) {
    const user = Meteor.users.findOne(userId)
    console.log(`Error Sending enrollment email to ${user.emails[0].address} : ${error}`)
    throw new Meteor.Error('500', `Error Sending enrollment email to ${user.emails[0].address}`, error)
  }
}

const tmpEmailVr = Accounts.sendVerificationEmail
Accounts.sendVerificationEmail = (userId) => {
  try {
    tmpEmailVr(userId)
    const template = EmailForms.Collections.EmailTemplate.findOne({ name: 'verifyEmail' })._id
    EmailLogs.insert({
      userId,
      template,
      sent: Date(),
    })
  } catch (error) {
    const user = Meteor.users.findOne(userId)
    console.error(`Error Sending verifyEmail to ${user.emails[0].address}:`, error)
    throw new Meteor.Error('500', `Error Sending verifyEmail to ${user.emails[0].address}`, error)
  }
}
