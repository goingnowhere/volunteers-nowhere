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
      name: 'SLaP',
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
  ],
  teams: [
    {
      name: 'Power',
      parent: 'SLaP',
      description: '',
      policy: 'public',
    },
    {
      name: 'Build',
      parent: 'BDSM',
      description: '',
      policy: 'public',
    },
    {
      name: 'NoInfo',
      parent: 'Volunteers',
      description: '',
      policy: 'public',
    },
  ],
}

export const createUnits = (Volunteers) => {
  if (Volunteers.Collections.Division.find().count() === 0) {
    units.divisions.forEach((doc) => {
      console.log(`creating fixture for ${doc.name}`)
      const id = Volunteers.Collections.Division.insert(doc)
      Roles.createRole(id)
    })
  }
  if (Volunteers.Collections.Department.find().count() === 0) {
    units.departments.forEach((doc) => {
      console.log(`creating fixture for ${doc.name}`)
      const parentId = Volunteers.Collections.Division.findOne({ name: doc.parent })._id
      const id = Volunteers.Collections.Department.insert({
        ...doc,
        parentId,
      })
      Roles.createRole(id)
      Roles.addRolesToParent(id, parentId)
    })
  }
  if (Volunteers.Collections.Team.find().count() === 0) {
    units.teams.forEach((doc) => {
      console.log(`creating fixture for ${doc.name}`)
      const parentId = Volunteers.Collections.Department.findOne({ name: doc.parent })._id
      const id = Volunteers.Collections.Team.insert({
        ...doc,
        parentId,
      })
      Roles.createRole(id)
      Roles.addRolesToParent(id, parentId)
    })
  }
}
