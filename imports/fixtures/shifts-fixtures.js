import { Random } from 'meteor/random'
import Moment from 'moment-timezone'
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment)

export const createShiftFixtures = (Volunteers, settings) => {
  const buildRange = [
    ...moment.range(settings.buildPeriod.start, settings.buildPeriod.end).by('days'),
  ]
  const strikeRange = [
    ...moment.range(settings.strikePeriod.start, settings.strikePeriod.end).by('days'),
  ]

  if (Volunteers.collections.shift.find().count() === 0) {
    Volunteers.collections.team.find().forEach((team) => {
      const type = Random.choice(['projects', 'shifts', 'both'])

      if (['shifts', 'both'].includes(type)) {
        console.log(`creating rota fixtures for ${team.name}`)
        Volunteers.methodBodies.rota.insert({
          parentId: team._id,
          title: `Some ${team.name} thing`,
          description: `Work with the ${team.name} team to do their thing.`,
          priority: Random.choice(['essential', 'important', 'normal']),
          policy: Random.choice(['public', 'requireApproval']),
          start: settings.eventPeriod.start,
          end: settings.eventPeriod.end,
          shifts: [1, 2, 3].slice(0, Random.choice([1, 2, 3])).map((val, i, array) => ({
            min: 2,
            max: 4,
            startTime: `${(i * 24) / (array.length + 1)}:00`,
            endTime: `${((i + 1) * 24) / (array.length + 1)}:00`,
          })),
        })
      }

      if (['projects', 'both'].includes(type)) {
        console.log(`creating project fixtures for ${team.name}`)

        const buildDateRange = buildRange.slice(Math.trunc(Random.fraction() * buildRange.length))
        const strikeDateRange =
          strikeRange.slice(0, Math.ceil(Random.fraction() * strikeRange.length) + 1)

        Volunteers.collections.project.insert({
          parentId: team._id,
          title: `Some ${team.name} project`,
          description: `Set-up the ${team.name} team stuff.`,
          priority: Random.choice(['essential', 'important', 'normal']),
          policy: Random.choice(['public', 'requireApproval']),
          start: buildDateRange[0].toDate(),
          end: buildDateRange[buildDateRange.length - 1].toDate(),
          staffing: buildDateRange.map((_date, i) => ({ min: i + 1, max: i + 2 })),
        })
        Volunteers.collections.project.insert({
          parentId: team._id,
          title: `Some ${team.name} strike`,
          description: `Strike the ${team.name} team stuff.`,
          priority: Random.choice(['essential', 'important', 'normal']),
          policy: Random.choice(['public', 'requireApproval']),
          start: strikeDateRange[0].toDate(),
          end: strikeDateRange[strikeDateRange.length - 1].toDate(),
          staffing: strikeDateRange.map((_date, i) =>
            ({ min: strikeDateRange.length - i, max: strikeDateRange.length - i + 1 })),
        })
      }
    })
  }
}
