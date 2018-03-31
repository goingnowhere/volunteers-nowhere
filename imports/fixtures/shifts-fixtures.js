/* eslint-disable object-curly-newline */
import 'fs'
import { Random } from 'meteor/random'

const groupBy = function groupBy(xs, key) {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

export const createShifts = (Volunteers) => {
  if (Volunteers.Collections.TeamShifts.find().count() === 0) {
    Volunteers.Collections.Team.find().fetch().forEach((team) => {
      try {
        const shifts = JSON.parse(Assets.getText(`nowhere2018/${team.name}.json`))
        Object.entries(groupBy(shifts, 'title')).forEach((g) => {
          const groupId = Random.id()
          g[1].forEach((doc) => {
            console.log(`creating fixture for ${doc.title} ${groupId}`)
            const parentId = team._id
            doc.start = new Date(doc.start)
            doc.start.setFullYear(doc.start.getFullYear() + 1)
            doc.end = new Date(doc.end)
            doc.end.setFullYear(doc.end.getFullYear() + 1)
            doc.min = 5
            doc.max = 10
            doc.priority = 'normal'
            doc.policy = 'public'
            doc.groupId = groupId
            Volunteers.Collections.TeamShifts.insert({
              ...doc,
              parentId,
            })
          })
        })
      } catch (err) {
        console.log('No Shifts for team ', team.name)
      }
    })
  }
}
