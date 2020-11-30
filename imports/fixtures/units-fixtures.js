import { Roles } from 'meteor/piemonkey:roles'

const units = {
  divisions: [
    {
      name: 'NOrg 2018',
      description: '',
      policy: 'public',
      parentId: 'TopEntity',
    },
  ],
  departments: [
    {
      name: 'SLAP',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'Volunteers',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'BDSM',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'Participants Wellness',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'Production',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'City Planning',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'Creativity',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'GG&P',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
    {
      name: 'Malfare',
      description: '',
      policy: 'public',
      parent: 'NOrg 2018',
    },
  ],
}
units.teams = JSON.parse(Assets.getText('nowhere2018/nowhere-teams.json'))

const leadDefaults = {
  title: 'Lead',
  priority: 'essential',
  policy: 'requireApproval',
}

export const createUnits = (Volunteers) => {
  if (Volunteers.Collections.division.find().count() === 0) {
    units.divisions.forEach((doc) => {
      console.log(`creating division ${doc.name}`)
      const id = Volunteers.Collections.division.insert(doc)
      Roles.createRole(id)
    })
  }
  if (Volunteers.Collections.department.find().count() === 0) {
    units.departments.forEach((dep) => {
      console.log(`creating department and meta-lead ${dep.name}`)
      const parentId = Volunteers.Collections.division.findOne({ name: dep.parent })._id
      const depId = Volunteers.Collections.department.insert({
        ...dep,
        parentId,
      })
      Volunteers.Collections.lead.insert({
        ...leadDefaults,
        description: `Meta-Lead of the ${dep.name} department.`,
        parentId: depId,
      })
      Roles.createRole(depId)
      Roles.addRolesToParent(depId, parentId)
    })
  }
  if (Volunteers.Collections.team.find().count() === 0) {
    units.teams.team.forEach((team) => {
      console.log(`creating team and lead ${team.name}`)
      const parentId = Volunteers.Collections.department.findOne({ name: team.parent })._id
      const teamId = Volunteers.Collections.team.insert({
        ...team,
        parentId,
      })
      Volunteers.Collections.lead.insert({
        ...leadDefaults,
        description: `Lead of the ${team.name} team.`,
        parentId: teamId,
      })
      Roles.createRole(teamId)
      Roles.addRolesToParent(teamId, parentId)
    })
  }
}
