import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Roles } from 'meteor/alanning:roles'

import { EventSettings } from '../both/collections/settings'

Migrations.config({
  log: true,
  logIfLatest: false,
  // Need to rename the collection if we want to base this DB on the old one
  collectionName: 'fistMigrations',
})

Migrations.add({
  version: 11,
  up() {
    // Last run migration needs to still exist for some reason
  },
})

Migrations.add({
  version: 12,
  up() {
    const existing = EventSettings.findOne()
    if (!existing.eventName) {
      EventSettings.update({}, { $set: { eventName: 'nowhere2023' } })
    }
  },
})

// Make anyone who was a 2022 admin one for 2023
Migrations.add({
  version: 13,
  up() {
    Meteor.users.update(
      {
        roles: { $elemMatch: { _id: 'admin', scope: 'nowhere2022' } },
      },
      { $addToSet: { roles: { _id: 'admin', scope: 'nowhere2023', assigned: true } } },
      { multi: true },
    )
    Meteor.users.update(
      {
        roles: { $elemMatch: { _id: 'manager', scope: 'nowhere2022' } },
      },
      { $addToSet: { roles: { _id: 'manager', scope: 'nowhere2023', assigned: true } } },
      { multi: true },
    )
  },
})

// Remove 'user' role as it served no purpose
Migrations.add({
  version: 14,
  up() {
    Roles.deleteRole('user')
  },
})
