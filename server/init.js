import { Mandrill } from 'meteor/wylio:mandrill'
import { Accounts } from 'meteor/accounts-base'
import { EmailForms } from 'meteor/abate:email-forms'
import { Volunteers } from '../both/init'
import { getContext } from '../both/email'
import { runFixtures } from '../imports/fixtures/index'

Meteor.startup(() => {
  runFixtures(Volunteers)
})

Meteor.startup(() => {
  Meteor.users._ensureIndex({
    terms: 1,
  })
})


Mandrill.config({
  username: process.env.MANDRILL_API_USER,
  key: process.env.MANDRILL_API_KEY,
  port: 587,
  host: 'smtps.mandrillapp.com',
  // baseUrl: 'https://mandrillapp.com/api/1.0/'  // update this in case Mandrill changes its API endpoint URL or version
})
Accounts.emailTemplates.headers = { 'X-MC-AutoText': true }

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
