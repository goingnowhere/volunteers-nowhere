/* eslint-disable object-curly-newline */
import 'fs'
import { Random } from 'meteor/random'
import { moment } from 'meteor/momentjs:moment'

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
        const parentId = team._id
        const { shifts = [], projects = [] } = JSON.parse(Assets.getText(`nowhere2018/${team.name}.json`))
        Object.entries(groupBy(shifts, 'title')).forEach((g) => {
          const groupId = Random.id()
          g[1].forEach((doc) => {
            console.log(`creating fixture for ${doc.title}`)
            const start = new Date(doc.start)
            start.setFullYear(start.getFullYear() + 1)
            const end = new Date(doc.end)
            end.setFullYear(end.getFullYear() + 1)
            Volunteers.Collections.TeamShifts.insert({
              min: 2,
              max: 4,
              priority: 'normal',
              policy: 'public',
              ...doc,
              start,
              end,
              groupId,
              parentId,
            })
          })
        })
        projects.forEach((project) => {
          const start = moment(project.start).add(1, 'year').startOf('day')
          const end = moment(project.end).add(1, 'year').endOf('day')
          const staffing = (new Array(end.dayOfYear() - (start.dayOfYear() + 1))).fill({ min: 1, max: 2 })
          Volunteers.Collections.Projects.insert({
            priority: 'normal',
            policy: 'requireApproval',
            staffing,
            ...project,
            parentId,
            start: start.toDate(),
            end: end.toDate(),
          })
        })
      } catch (err) {
        console.log('No Shifts for team ', team.name)
      }
    })
  }
}
