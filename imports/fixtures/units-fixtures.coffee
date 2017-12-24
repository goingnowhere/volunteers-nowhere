units =
  divisions: [
    {
      name: 'NOrg 2018'
      description: ''
      policy: 'public'
      parentId: 'TopEntity'
    }
  ]
  departments: [
    {
      name: 'SLaP'
      description: ''
      policy: 'public'
      parent: 'NOrg 2018'
    }
    {
      name: 'Volunteers'
      description: ''
      policy: 'public'
      parent: 'NOrg 2018'
    }
    {
      name: 'BDSM'
      description: ''
      policy: 'public'
      parent: 'NOrg 2018'
    }
  ]
  teams: [
    {
      name: 'Power'
      parent: "SLaP"
      description: ''
      policy: 'public'
    }
    {
      name: 'Build'
      parent: "BDSM"
      description: ''
      policy: 'public'
    }
    {
      name: 'NoInfo'
      parent: "Volunteers"
      description: ''
      policy: 'public'
    }
  ]

# XXX instead of share that is global, it should be an export ...
share.createUnits = (Volunteers) ->
  if Volunteers.Collections.Division.find().count() == 0
    for doc in units.divisions
      console.log "creating fixture for #{doc.name}"
      id = Volunteers.Collections.Division.insert(doc)
      Roles.createRole(id)
  if Volunteers.Collections.Department.find().count() == 0
    for doc in units.departments
      console.log "creating fixture for #{doc.name}"
      parentId = Volunteers.Collections.Division.findOne({name: doc.parent})._id
      doc.parentId = parentId
      id = Volunteers.Collections.Department.insert(doc)
      Roles.createRole(id)
      Roles.addRolesToParent(id, parentId)
  if Volunteers.Collections.Team.find().count() == 0
    for doc in units.teams
      console.log "creating fixture for #{doc.name}"
      parentId = Volunteers.Collections.Department.findOne({name: doc.parent})._id
      doc.parentId = parentId
      id = Volunteers.Collections.Team.insert(doc)
      Roles.createRole(id)
      Roles.addRolesToParent(id, parentId)
