// import _ from 'underscore'
// import { Accounts } from 'meteor/accounts-base'
// import { Roles } from 'meteor/piemonkey:roles'
import { Volunteers } from '../both/init'
import { runFixtures } from '../imports/fixtures/index'

Meteor.startup(() => {
  return runFixtures(Volunteers)
})
