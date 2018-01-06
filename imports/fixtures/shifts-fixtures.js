/* eslint-disable object-curly-newline */

const teams = ['Power', 'Build', 'NoInfo']

const shifts = {
  Power: [
    { title: 'Power Ranger', start: Date(), end: Date(), min: 3, max: 5, priority: 'essential', policy: 'public' },
    { title: 'Power Ranger', start: Date(), end: Date(), min: 3, max: 5, priority: 'essential', policy: 'public' },
    { title: 'Slap lead', start: Date(), end: Date(), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Slap lead', start: Date(), end: Date(), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Sound Lead', start: Date(), end: Date(), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Sound Lead', start: Date(), end: Date(), min: 1, priority: 'essential', policy: 'requireApproval' },
  ],
  NoInfo: [
    { title: 'helper', start: Date(), end: Date(), min: 3, max: 5, priority: 'normal', policy: 'public' },
    { title: 'noinfo lead', start: Date(), end: Date(), min: 1, priority: 'essential', policy: 'requireApproval' },
  ],
  Build: [],
}

export const createShifts = (Volunteers) => {
  if (Volunteers.Collections.TeamShifts.find().count() === 0) {
    teams.forEach((team) => {
      shifts[team].forEach((doc) => {
        console.log(`creating fixture for ${doc.title}`)
        const parentId = Volunteers.Collections.Team.findOne({ name: team })._id
        Volunteers.Collections.TeamShifts.insert({
          ...doc,
          parentId,
        })
      })
    })
  }
}
