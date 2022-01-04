import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'

Migrations.config({
  log: true,
  logIfLatest: false,
  // Need to rename the collection if we want to base this DB on the old one
  collectionName: 'fistMigrations',
})

Migrations.add({
  version: 9,
  up() {
    // Last run migration needs to still exist for some reason
  },
})

// Remove last year's tickets from users
Migrations.add({
  version: 10,
  up() {
    Meteor.users.update({}, { $unset: { ticketId: true } }, { multi: true })
  },
})

// Make anyone who was a 2020 admin one for 2022
Migrations.add({
  version: 11,
  up() {
    Meteor.users.update(
      {
        roles: { $elemMatch: { _id: 'admin', scope: 'nowhere2020' } },
      },
      { $addToSet: { roles: { _id: 'admin', scope: 'nowhere2022', assigned: true } } },
      { multi: true },
    )
    Meteor.users.update(
      {
        roles: { $elemMatch: { _id: 'manager', scope: 'nowhere2020' } },
      },
      { $addToSet: { roles: { _id: 'manager', scope: 'nowhere2022', assigned: true } } },
      { multi: true },
    )
  },
})
