import { Volunteers } from '../both/init'
import { runFixtures } from '../imports/fixtures/index'

Meteor.startup(() => {
  runFixtures(Volunteers)
})
