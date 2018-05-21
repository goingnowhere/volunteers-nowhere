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
    const { token } = Accounts.generateResetToken(pu._id, pendingUserData.fakeEmail, 'enrollAccount')
    return Accounts.urls.enrollAccount(token)
  })
  return links
}

/* Here we add application specific contexts for the emails-forms package */
export const getContext = (function getContext(cntxlist, user, context = {}) {
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
      case 'Voluntell': {
        context[`${cntx.namespace}`] = {}
        break
      }
      default:
    }
  })
  console.log(context)
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
  return doc.body
}

Accounts.emailTemplates.verifyEmail.from = () => EmailForms.getFrom('verifyEmail')
Accounts.emailTemplates.verifyEmail.subject = (user) => {
  const doc = EmailForms.previewTemplate('verifyEmail', user, getContext)
  return doc.subject
}
Accounts.emailTemplates.verifyEmail.text = (user, url) => {
  const context = { verifyEmail: { url } }
  const doc = EmailForms.previewTemplate('verifyEmail', user, getContext, context)
  return doc.body
}
