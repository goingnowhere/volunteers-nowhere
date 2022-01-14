import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Volunteers } from '../both/init'
import { runFixtures } from '../imports/fixtures/index'
import './email'
import './migrations'

// startup function - MAIN

Meteor.startup(() => {
  if (Meteor.isDevelopment) {
    runFixtures(Volunteers)
  }
})

Meteor.startup(() => {
  /* Migrations.unlock() */
  Migrations.migrateTo('latest')
})
