/* eslint-disable object-curly-newline */
import 'fs'

export const createShifts = (Volunteers) => {
  if (Volunteers.Collections.TeamShifts.find().count() === 0) {
    Volunteers.Collections.Team.find().fetch().forEach((team) => {
      try {
        const shifts = JSON.parse(Assets.getText(`nowhere2018/${team.name}.json`))
        shifts.forEach((doc) => {
          console.log(`creating fixture for ${doc.title}`)
          const parentId = team._id
          doc.start = new Date(doc.start)
          doc.end = new Date(doc.end)
          doc.min = 5
          doc.max = 10
          doc.reserved = 0
          doc.priority = 'normal'
          doc.policy = 'public'
          Volunteers.Collections.TeamShifts.insert({
            ...doc,
            parentId,
          })
        })
      } catch (err) {
        console.log('No Shifts for team ', team.name)
      }
    })
  }
}
