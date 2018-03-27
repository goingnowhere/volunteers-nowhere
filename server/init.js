// import _ from 'underscore'
// import { Accounts } from 'meteor/accounts-base'
// import { Roles } from 'meteor/piemonkey:roles'
import { Volunteers } from '../both/init'
import { runFixtures } from '../imports/fixtures/index'

Meteor.startup(() => {
  // Meteor.users._ensureIndex({
  //   "profile.firstName": "text",
  //   "profile.lastName": "text",
  //   "emails.0.address": "text"});
  // console.log(Meteor.users.find().fetch());
  runFixtures(Volunteers)
})
