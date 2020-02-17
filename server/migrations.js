import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import moment from 'moment'
import { Volunteers } from '../both/init'

Migrations.config({
  log: true,
  logIfLatest: false,
  // Need to rename the collection if we want to base this DB on the old one
  collectionName: 'fistMigrations',
})

Migrations.add({
  version: 4,
  up() {
    // Last run migration needs to still exist for some reason
  },
})

Migrations.add({
  version: 5,
  up() {
    const oldLeadSignups = new Meteor.Collection('nowhere2019.Volunteers.leadSignups')
    oldLeadSignups.find({ status: 'confirmed' })
      .map(({ _id, ...signup }) => Volunteers.Collections.signups.insert({ type: 'lead', ...signup }))
  },
})

// Move projects to 2020 to avoid dealing with year confusion
Migrations.add({
  version: 6,
  up() {
    const oldProjects = new Meteor.Collection('nowhere2019.Volunteers.projects')
    // TODO filter anything?
    oldProjects.find({}).map(({ groupId, ...project }) =>
      Volunteers.Collections.Projects.insert({
        ...project,
        start: moment(project.start).add(1, 'year').subtract(2, 'days').toDate(),
        end: moment(project.end).add(1, 'year').subtract(2, 'days').toDate(),
      }, { bypassCollection2: true }))
  },
})

// Copy-pasted from meteor-volunteers to avoid exporting everything for this
const createShifts = ({
  start,
  end,
  startTime,
  endTime,
  min,
  max,
  rotaId,
  rotaIndex,
  details,
  rangeOptions = {},
}) => {
  // Moment range goes into the future if start > end
  if (moment(start).isAfter(end)) return null
  return Array.from(moment.range(start, end).by('days', rangeOptions)).map((day) => {
    const [startHour, startMin] = startTime.split(':')
    const [endHour, endMin] = endTime.split(':')
    // this is the global timezone known by moment that we use to offset
    // the date given by the client to store it in the database as a js Date()
    // js Date() is timezone agnostic and always stored in UTC.
    // Using the method Date().toString() the local timezone (set on the server)
    // is used to print the date.
    const timezone = moment(day).format('ZZ')
    day.utcOffset(timezone)
    const shiftStart = moment(day).hour(startHour).minute(startMin).utcOffset(timezone, true)
    const shiftEnd = moment(day).hour(endHour).minute(endMin).utcOffset(timezone, true)
    // Deal with day wrap-around
    if (shiftEnd.isBefore(shiftStart)) {
      shiftEnd.add(1, 'day')
    }
    return Volunteers.Collections.TeamShifts.insert({
      ...details,
      min,
      max,
      start: shiftStart.toDate(),
      end: shiftEnd.toDate(),
      rotaId,
      rotaIndex,
    })
  })
}
const rotaInsertMethod = (rota) => {
  console.log('rotas.insert', rota)
  const {
    shifts,
    start,
    end,
  } = rota
  const details = _.omit(rota, 'shifts', 'start', 'end')
  // store rota
  const rotaId = Volunteers.Collections.rotas.insert(rota)
  // generate and store shifts
  return shifts.map((shiftSpecifics, rotaIndex) =>
    createShifts({
      ...shiftSpecifics,
      start,
      end,
      rotaId,
      rotaIndex,
      details,
    }))
}
// END hack-paste

// Move shifts over to rotas by using rota insert method code
Migrations.add({
  version: 7,
  up() {
    const oldShiftsCol = new Meteor.Collection('nowhere2019.Volunteers.teamShifts')
    const oldShifts = oldShiftsCol.find({}, { sort: { start: 1 } }).fetch()
    Object.entries(_.groupBy(oldShifts, 'groupId')).forEach(([, shiftGroup]) => {
      const {
        _id,
        groupId,
        rotaId,
        min,
        max,
        ...sanitised
      } = shiftGroup[0]
      const end = moment(shiftGroup[shiftGroup.length - 1].start).startOf('day')
      rotaInsertMethod({
        ...sanitised,
        start: moment(shiftGroup[0].start).startOf('day').toDate(),
        end: end.toDate(),
        shifts: shiftGroup.filter((shift) => moment(shift.start).isSame(end, 'day')).map((shift) => ({
          startTime: moment(shift.start).format('HH:mm'),
          endTime: moment(shift.end).format('HH:mm'),
          min: shift.min,
          max: shift.max,
        })),
      })
    })
  },
})

// Remove last years tickets from users
Migrations.add({
  version: 8,
  up() {
    Meteor.users.update({}, { $unset: { ticketId: true } }, { multi: true })
  },
})

// Forgot to adjust rota dates
Migrations.add({
  version: 9,
  up() {
    [Volunteers.Collections.TeamShifts, Volunteers.Collections.rotas].forEach((collection) => {
      collection.find({ start: { $lt: new Date('2020-01-01') } })
        .map((thing) => collection.update({ _id: (thing)._id }, {
          $set: {
            start: moment((thing).start).add(1, 'year').subtract(2, 'days').toDate(),
            end: moment((thing).end).add(1, 'year').subtract(2, 'days').toDate(),
          },
        }, { bypassCollection2: true }))
    })
  },
})
