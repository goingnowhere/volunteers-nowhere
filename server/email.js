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

const generateEnrollmentLinks = (address) => {
  const sel = { Email: address, fakeEmail: { $ne: null } }
  const links = pendingUsers.find(sel).map((pendingUserData) => {
    const pu = Accounts.findUserByEmail(pendingUserData.fakeEmail)
    if (pu) {
      const { token } = Accounts.generateResetToken(pu._id, pendingUserData.fakeEmail, 'enrollAccount')
      return Accounts.urls.enrollAccount(token)
    } return null
  })
  return links.filter(Boolean)
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
        const { address } = user.emails[0]
        context[`${cntx.namespace}`] = { users: generateEnrollmentLinks(address) }
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
          }
        })
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
        /* day.utcOffset(timezone) */
        const allShifts = list.map((s) => {
          const duty = Volunteers.Collections.TeamShifts.findOne(s.shiftId)
          const team = Volunteers.Collections.Team.findOne(s.parentId)
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
            start: moment(duty.start),
            end: moment(duty.end),
          }
        })
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
            start: moment(s.start),
            end: moment(s.end),
          }
        })
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
Accounts.emailTemplates.verifyEmail.text = (user, url) => {
  const context = { verifyEmail: { url } }
  const doc = EmailForms.previewTemplate('verifyEmail', user, getContext, context)
  return doc.text
}
