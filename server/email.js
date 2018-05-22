import { EmailForms } from 'meteor/abate:email-forms'
import { Accounts } from 'meteor/accounts-base'
import { Volunteers } from '../both/init'
import { pendingUsers } from './importUsers'
import './accounts'
import {
  isManagerMixin,
  ValidatedMethodWithMixin,
} from '../both/authMixins'


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
        const list = Volunteers.Collections.LeadSignups.find({ userId: user._id })
        const leads = list.map((s) => {
          const duty = Volunteers.Collections.Lead.findOne(s.shiftId)
          let unit = Volunteers.Collections.Team.findOne(s.parentId)
          if (!unit) {
            unit = Volunteers.Collections.Department.findOne(s.parentId)
          }
          const { enrolled, notification } = s
          return {
            enrolled, notification, title: duty.title, teamName: unit.name,
          }
        })
        const newLeadEnrollments = leads.filter(s => (s.enrolled && (!s.notification)))
        if (context[`${cntx.namespace}`]) {
          context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], { leads, newLeadEnrollments })
        } else {
          context[`${cntx.namespace}`] = { leads, newLeadEnrollments }
        }
        break
      }
      case 'Shifts': {
        const list = Volunteers.Collections.ShiftSignups.find({ userId: user._id })
        const shifts = list.map((s) => {
          const duty = Volunteers.Collections.TeamShifts.findOne(s.shiftId)
          const team = Volunteers.Collections.Team.findOne(s.parentId)
          const { enrolled, notification } = s
          return {
            enrolled,
            notification,
            title: duty.title,
            teamName: team.name,
            start: duty.start,
            end: duty.end,
          }
        })
        const newShiftEnrollments = shifts.filter(s => (s.enrolled && (!s.notification)))
        if (context[`${cntx.namespace}`]) {
          context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], { shifts, newShiftEnrollments })
        } else {
          context[`${cntx.namespace}`] = { shifts, newShiftEnrollments }
        }
        break
      }
      case 'Projects': {
        const list = Volunteers.Collections.ProjectSignups.find({ userId: user._id })
        const projects = list.map((s) => {
          const duty = Volunteers.Collections.Projects.findOne(s.shiftId)
          const team = Volunteers.Collections.Team.findOne(s.parentId)
          const { enrolled, notification } = s
          return {
            enrolled,
            notification,
            title: duty.title,
            teamName: team.name,
            start: s.start,
            end: s.end,
          }
        })
        const newProjectEnrollments = projects.filter(s => (s.enrolled && (!s.notification)))
        if (context[`${cntx.namespace}`]) {
          context[`${cntx.namespace}`] = _.extend(context[`${cntx.namespace}`], { projects, newProjectEnrollments })
        } else {
          context[`${cntx.namespace}`] = { projects, newProjectEnrollments }
        }
        break
      }
      default:
    }
  })
  /* console.log(context) */
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
