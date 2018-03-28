import { Volunteers } from '../both/init'
import { runFixtures } from '../imports/fixtures/index'

Meteor.startup(() => {
  Meteor.users._ensureIndex({
    "profile.firstName": 1,
    "profile.lastName": 1,
    "emails.0.address": 1});
  runFixtures(Volunteers)
})
