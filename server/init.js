import { Mandrill } from 'meteor/wylio:mandrill'
// import { Email } from 'meteor/email'
import { Accounts } from 'meteor/accounts-base'
import { Volunteers } from '../both/init'
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

Accounts.emailTemplates.from = 'VMS <vms-support@goingnowhere.org>'
Accounts.emailTemplates.siteName = 'VMS goingnowhere 2018'

// override for verification emails
Accounts.emailTemplates.verifyEmail.from = () => 'No-replay <no-reply@goingnowhere.org>'
Accounts.emailTemplates.verifyEmail.subject = () => 'Verify your email address'

Accounts.emailTemplates.headers = { 'X-MC-AutoText': true }
