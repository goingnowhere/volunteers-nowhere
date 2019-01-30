import { Mandrill } from 'meteor/wylio:mandrill'
import { Accounts } from 'meteor/accounts-base'
import { Migrations } from 'meteor/percolate:migrations'
import { Volunteers } from '../both/init'
import { runFixtures } from '../imports/fixtures/index'
import './email'
import './migrations'

if (process.env.MANDRILL_API_USER) {
  Mandrill.config({
    username: process.env.MANDRILL_API_USER,
    key: process.env.MANDRILL_API_KEY,
    port: 587,
    host: 'smtps.mandrillapp.com',
  // baseUrl: 'https://mandrillapp.com/api/1.0/'  // update this in case Mandrill changes its API endpoint URL or version
  })
  Accounts.emailTemplates.headers = { 'X-MC-AutoText': true }
}

// startup function - MAIN
Meteor.startup(() => {
  runFixtures(Volunteers)
})

Meteor.startup(() => {
  /* Migrations.unlock() */
  Migrations.migrateTo('latest')
})
