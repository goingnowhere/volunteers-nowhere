import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Migrations } from 'meteor/percolate:migrations'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import moment from 'moment'
import { Volunteers } from '../both/init'

Migrations.config({
  log: true,
  logIfLatest: false,
  // Need to rename the collection if we want to base this DB on the old one
  collectionName: 'fistMigrations',
})

// Create new admins with random passwords
Migrations.add({
  version: 1,
  up() {
    const rich = Accounts.createUser({
      email: 'rich@goingnowhere.org',
      password: Random.id(),
    })
    const hardcastle = Accounts.createUser({
      email: 'hardcastle@goingnowhere.org',
      password: Random.id(),
    })
    Roles.addUsersToRoles(rich, 'admin')
    Roles.addUsersToRoles(hardcastle, 'admin')
  },
})

// Move shifts to 2019 to avoid dealing with year confusion
Migrations.add({
  version: 2,
  up() {
    [Volunteers.Collections.TeamShifts, Volunteers.Collections.Projects].forEach((collection) => {
      collection.find({}).map(thing => collection.update({ _id: thing._id }, {
        $set: {
          start: moment(thing.start).add(1, 'year').add(6, 'days').toDate(),
          end: moment(thing.end).add(1, 'year').add(6, 'days').toDate(),
        },
      }, { bypassCollection2: true }))
    })
  },
})

// Separate Production and finance
Migrations.add({
  version: 3,
  up() {
    if (Meteor.isProduction) {
      const division = Volunteers.Collections.Division.findOne()
      const finance = Volunteers.Collections.Department.findOne({ name: 'Finance' })

      const prodId = Volunteers.Collections.Department.insert({
        parentId: division._id,
        name: 'Production',
        skills: [],
        quirks: [],
        email: 'production@goingnowhere.org',
      })
      Roles.createRole(prodId)
      Roles.addRolesToParent(prodId, division._id)

      Volunteers.Collections.Team.find({
        name: {
          $in: ['Event Time Production / Event Production Office', 'Shit Ninjas'],
        },
      }).map(team => team._id)
        .forEach((prodTeamId) => {
          Volunteers.Collections.Team.update({ _id: prodTeamId }, { $set: { parentId: prodId } })
          Roles.removeRolesFromParent(prodTeamId, finance._id)
          Roles.addRolesToParent(prodTeamId, prodId)
        })

      const beansId = Volunteers.Collections.Team.insert({
        parentId: finance._id,
        name: 'Beans Office',
        skills: [],
        quirks: [],
      })
      Roles.createRole(beansId)
      Roles.addRolesToParent(beansId, finance._id)
    }
  },
})

// Move around ticket data on existing users
Migrations.add({
  version: 4,
  up() {
    Meteor.users.update({}, { $unset: { quicket: '' } }, { multi: true })
  },
})

Migrations.add({
  version: 5,
  up() {
    Volunteers.Collections.ShiftSignups.find().map(signup =>
      Volunteers.Collections.signups.insert({ ...signup, type: 'shift' }))
    Volunteers.Collections.TaskSignups.find().map(signup =>
      Volunteers.Collections.signups.insert({ ...signup, type: 'task' }))
    Volunteers.Collections.ProjectSignups.find().map(signup =>
      Volunteers.Collections.signups.insert({ ...signup, type: 'project' }))
    Volunteers.Collections.LeadSignups.find().map(signup =>
      Volunteers.Collections.signups.insert({ ...signup, type: 'lead' }))
  },
})
