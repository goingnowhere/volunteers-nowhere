/* eslint-disable no-console */
import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Roles } from 'meteor/alanning:roles'
import { wrapAsync } from 'meteor/goingnowhere:volunteers'

import { EventSettings } from '../both/collections/settings'
import { Volunteers } from '../both/init'

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

// Move profiles over from 2022 as this was missed in the move
Migrations.add({
  version: 15,
  up() {
    const { collections, prevEventCollections } = Volunteers
    const noProfileUsers = Meteor.users.aggregate([
      {
        $lookup: {
          from: collections.volunteerForm._name,
          localField: '_id',
          foreignField: 'userId',
          as: 'volForms',
        },
      }, {
        $match: { volForms: { $size: 0 } },
      }, {
        $lookup: {
          from: prevEventCollections.volunteerForm._name,
          localField: '_id',
          foreignField: 'userId',
          as: 'prevForm',
        },
      },
    ])

    wrapAsync(async () => {
      const toInsert = noProfileUsers.filter(user => user.prevForm.length >= 1)
        .map(user => user.prevForm[0])
      if (toInsert.length >= 1) {
        const insertResult = await collections.volunteerForm.rawCollection()
          .insertMany(toInsert)
        console.log('Copied ', insertResult.insertedCount, ' profiles from prev event')
      }
    })()

    const stillNoProfileIds = noProfileUsers
      .filter(user => user.prevForm.length === 0 && user.profile.formFilled)
      .map(user => user._id)
    Meteor.users.update({ _id: { $in: stillNoProfileIds } },
      { $set: { 'profile.formFilled': false } }, { multi: true })
    console.log('Marked ', stillNoProfileIds.length, ' users as having no form')
  },
})
