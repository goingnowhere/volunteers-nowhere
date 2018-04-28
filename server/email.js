import { Mongo } from 'meteor/mongo'
import { EmailForms } from 'meteor/abate:email-forms'
import { Accounts } from 'meteor/accounts-base'
import { ValidatedMethodWithMixin, isManagerMixin, Volunteers } from '../both/init'

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

export const EmailLogs = new Mongo.Collection('emailLogs')

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
      default:
    }
  })
  return context
})

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
