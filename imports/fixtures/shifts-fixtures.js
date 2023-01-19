import { Random } from 'meteor/random'

export const createShiftFixtures = (Volunteers, settings) => {
  if (Volunteers.collections.shift.find().count() === 0) {
    // Volunteers.collections.team.find({ name: 'Build Crew' }).forEach(team => {
    //   methodBodies.projects
    // })

    Volunteers.collections.team.find().forEach((team) => {
      console.log(`creating rota fixtures for ${team.name}`)
      Volunteers.methodBodies.rota.insert({
        parentId: team._id,
        title: `Some ${team.name} thing`,
        description: `Work with the ${team.name} team to do their thing.`,
        priority: 'normal',
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
    })
  }
}
