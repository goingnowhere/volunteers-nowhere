Meteor.startup ->
  allRoles = ['manager']
  if Meteor.roles.find().count() < 1
    for role in allRoles
      Roles.createRole role

  defaultUsers = [
    {
      email: 'admin@example.com',
      password: 'apple1'
      profile: { role: 'manager'}
    },
  ]

  _.each defaultUsers, (options) ->
    if !Meteor.users.findOne({ "emails.address" : options.email })
      role = options.profile.role
      userId = Accounts.createUser(options)
      Meteor.users.update(userId, {$set: {"emails.0.verified" :true}})
      Roles.addUsersToRoles(userId, role, Roles.GLOBAL_GROUP)

# ------------------------------------------------------------------------------
Meteor.startup ->
  Factory.define('fakeUser', Meteor.users, {
    'profile':
      'firstName': () -> faker.name.firstName(),
      'lastName': () -> faker.name.lastName(),
      'role': () -> 'user'
    'emails': () ->
      [
        'address': faker.internet.email(),
        'verified': true
      ]
    }
  ).after((user) ->
    Roles.addUsersToRoles(user._id, [ user.profile.role ] )
  )
  _.times(10,() -> Factory.create('fakeUser'))
  _.times(2,() -> Factory.create('fakeUser',{'profile.role': 'manager'}))

  Factory.define('fakeVolunteersForm',Volunteers.Collections.VolunteerForm,{
    'userId': Factory.get('fakeUser'),
  })
  _.times(10,() -> Factory.create('fakeVolunteersForm'))

  getRandom = (name) -> _.sample(Factory.get(name).collection.find().fetch())

  Factory.define('fakeDivision',Volunteers.Collections.Division,
    {
      'name': () -> faker.company.companyName(),
      'parentId': "top",
      # 'policy': 'public',
      'description': () -> faker.lorem.paragraph(),
      'tags': () -> faker.lorem.words(),
    })
  _.times(10,() -> Factory.create('fakeDivision'))

  Factory.define('fakeDivisionLead',Volunteers.Collections.Lead,
    {
      'parentId': () -> getRandom('fakeDivision')._id,
      'userId': () -> getRandom('fakeUser')._id,
      'role': 'lead',
      'title': "Meta-Lead",
      'description': () -> faker.lorem.paragraph(),
      'position': 'division',
      'policy': _.sample(["public","requireApproval","adminOnly"]),
    })
  _.times(10,() -> Factory.create('fakeDivisionLead'))

  Factory.define('fakeDepartment',Volunteers.Collections.Department,
    {
      'name': () -> faker.company.companyName(),
      # 'policy': 'public',
      'description': () -> faker.lorem.paragraph(),
      'tags': () -> faker.lorem.words(),
      'parentId': () -> getRandom('fakeDivision')._id
    })
  _.times(20,() -> Factory.create('fakeDepartment'))

  Factory.define('fakeDepartmentLead',Volunteers.Collections.Lead,
    {
      'parentId': () -> getRandom('fakeDepartment')._id,
      'userId': () -> getRandom('fakeUser')._id,
      'role': 'lead',
      'title': "2nd level Lead",
      'description': () -> faker.lorem.paragraph(),
      'position': 'department',
      'policy': _.sample(["public","requireApproval","adminOnly"]),
    })
  _.times(10,() -> Factory.create('fakeDepartmentLead'))

  Factory.define('fakeTeam',Volunteers.Collections.Team,
    {
      'name': () -> faker.company.companyName(),
      # 'policy': _.sample(["public","requireApproval","adminOnly"]),
      'description': () -> faker.lorem.paragraph(),
      'tags': () -> faker.lorem.words(),
      'parentId': () -> getRandom('fakeDepartment')._id
    })
  _.times(40,() -> Factory.create('fakeTeam'))

  Factory.define('fakeTeamLead',Volunteers.Collections.Lead,
    {
      'parentId': () -> getRandom('fakeTeam')._id,
      'userId': () -> getRandom('fakeUser')._id,
      'role': 'lead',
      'title': "Head Chef",
      'description': () -> faker.lorem.paragraph(),
      'position': 'team',
      'policy': _.sample(["public","requireApproval","adminOnly"]),
    })
  _.times(15,() -> Factory.create('fakeTeamLead'))

  Factory.define('fakeTeamShifts',Volunteers.Collections.TeamShifts,
    {
      'parentId': () -> getRandom('fakeTeam')._id,
      'title': () -> faker.lorem.sentence(),
      'description': () -> faker.lorem.paragraph(),
      'policy': _.sample(["public","requireApproval","adminOnly"]),
      'min': () -> faker.random.number(1,3),
      'max': () -> faker.random.number(4,6),
      'start': () -> faker.date.recent(30),
      'end': () -> moment(this.start).add(3, 'h').toDate()
    })
  _.times(50,() -> Factory.create('fakeTeamShifts'))

  Factory.define('fakeTeamTasks',Volunteers.Collections.TeamTasks,
    {
      'parentId': () -> getRandom('fakeTeam')._id,
      'title': () -> faker.lorem.sentence(),
      'description': () -> faker.lorem.paragraph(),
      'policy': _.sample(["public","requireApproval","adminOnly"]),
      'dueDate': () -> faker.date.future(),
      'estimatedTime': () -> _.sample(["1-3hs", "3-6hs", "6-12hs","1d","2ds","more"]),
      'status': () -> _.sample(["pending", "archived", "done"])
      'min': () -> faker.random.number(1,3),
      'max': () -> faker.random.number(4,6),
    })
  _.times(50,() -> Factory.create('fakeTeamTasks'))
