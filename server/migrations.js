/* eslint-disable no-console */
import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Roles } from 'meteor/alanning:roles'
import { rawCollectionOp } from 'meteor/goingnowhere:volunteers'

import { EventSettings } from '../both/collections/settings'
import { Volunteers } from '../both/init'

Migrations.config({
  log: true,
  logIfLatest: false,
  // Need to rename the collection if we want to base this DB on the old one
  collectionName: 'fistMigrations',
})

Migrations.add({
  version: 15,
  up() {
    // Last run migration needs to still exist for some reason
  },
})

// Make anyone who was a 2023 admin one for 2024
Migrations.add({
  version: 16,
  up() {
    Meteor.users.update(
      {
        roles: { $elemMatch: { _id: 'admin', scope: 'nowhere2023' } },
      },
      { $addToSet: { roles: { _id: 'admin', scope: 'nowhere2024', assigned: true } } },
      { multi: true },
    )
    Meteor.users.update(
      {
        roles: { $elemMatch: { _id: 'manager', scope: 'nowhere2023' } },
      },
      { $addToSet: { roles: { _id: 'manager', scope: 'nowhere2024', assigned: true } } },
      { multi: true },
    )
  },
})
