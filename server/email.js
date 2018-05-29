import { EmailForms } from 'meteor/abate:email-forms'
import { Accounts } from 'meteor/accounts-base'
import { Email } from 'meteor/email'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from '../both/init'
import { pendingUsers } from './importUsers'
import './accounts'
import {
  isManagerMixin,
  ValidatedMethodWithMixin,
} from '../both/authMixins'

moment.tz.setDefault('Europe/Paris')

export const EmailLogs = new Mongo.Collection('emailLogs')
export const WrapEmailSend = (user, doc) => {
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
}

export const insertEmailTemplateMethod =
  ValidatedMethodWithMixin(
    EmailForms.insertEmailTemplate,
    [isManagerMixin],
  )

export const updateEmailTemplateMethod =
  ValidatedMethodWithMixin(
    EmailForms.updateEmailTemplate,
    [isManagerMixin],
  )

export const removeEmailTemplateMethod =
  ValidatedMethodWithMixin(
    EmailForms.removeEmailTemplate,
    [isManagerMixin],
  )

const generateEnrollmentLink = (userId, fakeEmail) => {
  const { token } = Accounts.generateResetToken(userId, fakeEmail, 'enrollAccount')
  return Accounts.urls.enrollAccount(token)
}

/* Here we add application specific contexts for the emails-forms package */
export const getContext = (function getContext(cntxlist, user, context = {}) {
  if (!user) { return context }
  cntxlist.forEach((cntx) => {
    switch (cntx.name) {
      case 'VolProfile': {
        const volform = Volunteers.Collections.VolunteerForm.findOne({ userId: user._id })
        context[`${cntx.namespace}`] = {
          playaName: volform.playaName,
        }
        break
      }
      case 'Tickets': {
        /* the Tickets context is run for a user and pulls all the
           pending users email associated with his principal
           email address. Use we the pending user profile to generate
           the enrollment link */
        const email = user.emails[0].address
        const {
          FirstName, LastName, TicketId, fakeEmail,
        } = pendingUsers.findOne({ Email: { $regex: new RegExp(email, 'i') } })
        const pendingUser = Accounts.findUserByEmail(fakeEmail)
        const enrollmentLink = generateEnrollmentLink(pendingUser._id, fakeEmail)
        context[`${cntx.namespace}`] = {
          enrollmentLink, LastName, FirstName, TicketId,
        }
        break
      }
      case 'UserTeams': {
        const sel = { userId: user._id, status: { $in: ['confirmed', 'pending', 'refused'] } }
        const shiftSignups = Volunteers.Collections.ShiftSignups.find(sel).map(s => _.extend(s, { type: 'shift' }))
        const leadSignups = Volunteers.Collections.LeadSignups.find(sel).map(s => _.extend(s, { type: 'lead' }))
        const projectSignups = Volunteers.Collections.ProjectSignups.find(sel).map(s => _.extend(s, { type: 'project' }))
        const allSignups = shiftSignups.concat(leadSignups).concat(projectSignups)
        const emails = Object.keys(_.groupBy(allSignups, 'parentId')).map((parentId) => {
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
        const sel = { userId: user._id, status: { $in: ['confirmed', 'pending', 'refused'] } }
        const list = Volunteers.Collections.LeadSignups.find(sel)
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
        const newLeadEnrollments = allLeads.filter(s => (
          s.enrolled && (!s.notification) && (s.status === 'confirmed')))
        const newLeadReviews = allLeads.filter(s => (s.reviewed && (!s.notification)))
        const leads = allLeads.filter(s => ((s.status === 'confirmed') || (s.status === 'pending')))
        const doc = { leads, newLeadEnrollments, newLeadReviews }
        if (context[`${cntx.namespace}`]) {
          context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], doc)
        } else {
          context[`${cntx.namespace}`] = doc
        }
        break
      }
      case 'Shifts': {
        const sel = { userId: user._id, status: { $in: ['confirmed', 'pending', 'refused'] } }
        const list = Volunteers.Collections.ShiftSignups.find(sel)
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

        const newShiftEnrollments = allShifts.filter(s => (
          s.enrolled && (!s.notification) && (s.status === 'confirmed')))
        const newShiftReviews = allShifts.filter(s => (s.reviewed && (!s.notification)))
        const shifts = allShifts.filter(s => ((s.status === 'confirmed') || (s.status === 'pending')))
        const doc = { shifts, newShiftEnrollments, newShiftReviews }
        if (context[`${cntx.namespace}`]) {
          context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], doc)
        } else {
          context[`${cntx.namespace}`] = doc
        }
        break
      }
      case 'Projects': {
        const sel = { userId: user._id, status: { $in: ['confirmed', 'pending', 'refused'] } }
        const list = Volunteers.Collections.ProjectSignups.find(sel)
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

        const newProjectEnrollments = allProjects.filter(s => (
          s.enrolled && (!s.notification) && (s.status === 'confirmed')))
        const newProjectReviews = allProjects.filter(s => (s.reviewed && (!s.notification)))
        const projects = allProjects.filter(s => ((s.status === 'confirmed') || (s.status === 'pending')))
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
})


/* Accounts.onEnrollmentLink((token, done) => {

  }) */

// Defaults
Accounts.emailTemplates.from = 'VMS <vms-support@goingnowhere.org>'
Accounts.emailTemplates.siteName = 'VMS goingnowhere 2018'

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
    console.log(`Error Sending verifyEmail to ${user.emails[0].address} : ${error}`)
    throw new Meteor.Error('500', `Error Sending verifyEmail to ${user.emails[0].address}`, error)
  }
}
