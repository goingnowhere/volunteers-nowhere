import moment from 'moment'
import { EmailForms } from 'meteor/abate:email-forms'
import { EventSettings } from '../../both/collections/settings'

// Event is on second Sunday in July so 8th is always in that week (0 is Sunday)
const nextEventStart = moment({ month: 6, day: 8 }).day(2)
if (nextEventStart.isBefore(moment())) {
  nextEventStart.add(1, 'year')
}

// .day() flows over by weeks so 7 is the next Sunday after a day
const settings = {
  buildPeriod: {
    start: moment(nextEventStart).day(1).subtract(3, 'weeks').toDate(),
    end: moment(nextEventStart).day(1).toDate(),
  },
  eventPeriod: {
    start: moment(nextEventStart).toDate(),
    end: moment(nextEventStart).day(7).toDate(),
  },
  strikePeriod: {
    start: moment(nextEventStart).day(8).toDate(),
    end: moment(nextEventStart).day(14).toDate(),
  },
  earlyEntryMax: 120,
  barriosArrivalDate: moment(nextEventStart).day(-1).subtract(1, 'weeks').toDate(),
  cronFrequency: 'every 15 mins',
  fistOpenDate: moment(nextEventStart).month(0).date(1).toDate(),
}

export const createSettings = () => {
  const existing = EventSettings.find().fetch()
  if (existing.length === 0) {
    console.log('Create Settings')
    EventSettings.insert(settings)
    return settings
  }
  return existing
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
