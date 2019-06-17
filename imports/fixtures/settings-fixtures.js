import { EmailForms } from 'meteor/abate:email-forms'
import { EventSettings } from '../../both/collections/settings'

const settings = {
  buildPeriod: { start: new Date(2019, 6, 11), end: new Date(2019, 7, 1) },
  eventPeriod: { start: new Date(2019, 7, 2), end: new Date(2019, 7, 8) },
  strikePeriod: { start: new Date(2019, 7, 9), end: new Date(2019, 7, 15) },
  earlyEntryMax: 120,
  barriosArrivalDate: new Date(2019, 6, 31),
  cronFrequency: 'every 15 mins',
  fistOpenDate: new Date(2019, 2, 1),
}

export const createSettings = () => {
  if (EventSettings.find().count() === 0) {
    console.log('Create Settings')
    EventSettings.insert(settings)
  }
}

const emailTemplates = [{
  name: 'enrollAccount',
  context: EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Site'] } }).fetch(),
  from: 'no-reply@goingnowhere.org',
  subject: 'Join us',
  body: 'Dear {{user.firstName}}, click on this link {{enrollAccount.url}} to enroll',
},
{
  name: 'verifyEmail',
  context: EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Site'] } }).fetch(),
  from: 'no-reply@goingnowhere.org',
  subject: 'Verify your email',
  body: 'Dear {{user.firstName}}, click on this link {{verifyEmail.url}} to verify your email',
},
]

export const createEmailTemplates = () => {
  // if (!EmailForms.Collections.EmailTemplate.find({ name: { $in: ['enrollAccount', 'verifyEmail'] } }) === 0) {
  console.log('creating email templates')
  emailTemplates.forEach(doc =>
    EmailForms.Collections.EmailTemplate.insert(doc))
  // }
}
