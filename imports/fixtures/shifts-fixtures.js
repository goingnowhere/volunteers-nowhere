/* eslint-disable object-curly-newline */

const teams = ['Power', 'Build', 'NoInfo']

const shifts = {
  Power: [
    { title: 'Slap Day lead', start: Date('July 3, 2018 08:00'), end: Date('July 3, 2018 18:00'), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Power Ranger', start: Date('July 3, 2018 08:00'), end: Date('July 3, 2018 12:00'), min: 3, max: 5, priority: 'important', policy: 'public' },
    { title: 'Power Ranger', start: Date('July 3, 2018 12:00'), end: Date('July 3, 2018 18:00'), min: 3, max: 5, priority: 'important', policy: 'public' },

    { title: 'Slap Day lead', start: Date('July 4, 2018 08:00'), end: Date('July 4, 2018 18:00'), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Power Ranger', start: Date('July 4, 2018 08:00'), end: Date('July 4, 2018 12:00'), min: 3, max: 5, priority: 'important', policy: 'public' },
    { title: 'Power Ranger', start: Date('July 4, 2018 12:00'), end: Date('July 4, 2018 18:00'), min: 3, max: 5, priority: 'important', policy: 'public' },

    { title: 'Sound Day Lead', start: Date('July 5, 2018 08:00'), end: Date('July 5, 2018 18:00'), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Sound Day Lead', start: Date('July 5, 2018 18:00'), end: Date('July 6, 2018 02:00'), min: 1, priority: 'essential', policy: 'requireApproval' },
  ],
  NoInfo: [
    { title: 'Day Lead', start: Date('July 5, 2018 08:00'), end: Date('July 5, 2018 18:00'), min: 1, priority: 'essential', policy: 'requireApproval' },
    { title: 'Helper', start: Date('July 5, 2018 08:00'), end: Date('July 5, 2018 12:00'), min: 3, max: 5, priority: 'normal', policy: 'public' },
    { title: 'Helper', start: Date('July 5, 2018 08:00'), end: Date('July 5, 2018 12:00'), min: 3, max: 5, priority: 'normal', policy: 'public' },
  ],
  Build: [
    { title: 'Builder', start: Date('June 20, 2018 08:00'), end: Date('June 30, 2018 24:00'), min: 80, max: 100, priority: 'important', policy: 'requireApproval' },
  ],
}

export const createShifts = (Volunteers) => {
  if (Volunteers.Collections.TeamShifts.find().count() === 0) {
    teams.forEach((team) => {
      shifts[team].forEach((doc) => {
        console.log(`creating fixture for ${doc.title}`)
        const parentId = Volunteers.Collections.Team.findOne({ name: team })._id
        doc.reserved = 0
        Volunteers.Collections.TeamShifts.insert({
          ...doc,
          parentId,
        })
      })
    })
  }
}
