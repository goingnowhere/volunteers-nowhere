Meteor.startup ->
  console.log "startup"
  allRoles = ['manager']
  if Meteor.roles.find({ _id: { $in: allRoles } }).count() < 1
    for role in allRoles
      Roles.createRole role

  defaultUsers = [
    {
      email: 'admin@example.com',
      password: 'apple1'
    },
  ]

  _.each defaultUsers, (options) ->
    if !Meteor.users.findOne({ "emails.address" : options.email })
      userId = Accounts.createUser(options)
      Meteor.users.update(userId, {$set: {"emails.0.verified" :true}})
      Roles.addUsersToRoles(userId, 'manager')

# ------------------------------------------------------------------------------
Meteor.startup ->
  # pick one collection to avoid adding new data at each server restart
  if Volunteers.Collections.Lead.find().count() == 0
    Factory.define('fakeUser', Meteor.users, {
      'profile':
        'firstName': () -> faker.name.firstName(),
        'lastName': () -> faker.name.lastName(),
      'emails': () ->
        [
          'address': faker.internet.email(),
          'verified': true
        ]
      }
    )
    _.times(10,() -> Factory.create('fakeUser'))

    Factory.define('fakeVolunteersForm',Volunteers.Collections.VolunteerForm,{
      'userId': () -> Factory.get('fakeUser'),
    })
    _.times(10,() -> Factory.create('fakeVolunteersForm'))

    getRandom = (name) ->
      if name != 'User'
        _.sample(Volunteers.Collections[name].find().fetch())
      else
        _.sample(Factory.get('fakeUser').collection.find().fetch())

    Factory.define('fakeDivisionLead',Volunteers.Collections.Lead,
      {
        'parentId': () -> getRandom('Division')._id,
        'userId': () -> getRandom('User')._id,
        'role': () -> 'lead',
        'title': () -> "Meta-Lead",
        'description': () -> faker.lorem.paragraph(),
        'position': () -> 'division',
        'policy': () -> _.sample(["public","requireApproval","adminOnly"]),
      })
    _.times(10,() -> Factory.create('fakeDivisionLead'))

    Factory.define('fakeDepartmentLead',Volunteers.Collections.Lead,
      {
        'parentId': () -> getRandom('Department')._id,
        'userId': () -> getRandom('User')._id,
        'role': () -> 'lead',
        'title': () -> "2nd level Lead",
        'description': () -> faker.lorem.paragraph(),
        'position': () -> 'department',
        'policy': () -> _.sample(["public","requireApproval","adminOnly"]),
      })
    _.times(10,() -> Factory.create('fakeDepartmentLead'))

    Factory.define('fakeTeamLead',Volunteers.Collections.Lead,
      {
        'parentId': () -> getRandom('Team')._id,
        'userId': () -> getRandom('User')._id,
        'role': () -> 'lead',
        'title': () -> "Head Chef",
        'description': () -> faker.lorem.paragraph(),
        'position': () -> 'team',
        'policy': () -> _.sample(["public","requireApproval","adminOnly"]),
      })
    _.times(15,() -> Factory.create('fakeTeamLead'))

    Factory.define('fakeTeamShifts',Volunteers.Collections.TeamShifts,
      {
        'parentId': () -> getRandom('Team')._id,
        'title': () -> faker.lorem.sentence(),
        'description': () -> faker.lorem.paragraph(),
        'policy': () -> _.sample(["public","requireApproval","adminOnly"]),
        'min': () -> faker.random.number(1,3),
        'max': () -> faker.random.number(4,6),
        'start': () -> faker.date.recent(30),
        'end': () -> moment(this.start).add(3, 'h').toDate()
      })
    _.times(50,() -> Factory.create('fakeTeamShifts'))

    Factory.define('fakeTeamTasks',Volunteers.Collections.TeamTasks,
      {
        'parentId': () -> getRandom('Team')._id,
        'title': () -> faker.lorem.sentence(),
        'description': () -> faker.lorem.paragraph(),
        'policy': () -> _.sample(["public","requireApproval","adminOnly"]),
        'dueDate': () -> faker.date.future(),
        'estimatedTime': () -> _.sample(["1-3hs", "3-6hs", "6-12hs","1d","2ds","more"]),
        'status': () -> _.sample(["pending", "archived", "done"])
        'min': () -> faker.random.number(1,3),
        'max': () -> faker.random.number(4,6),
      })
    _.times(50,() -> Factory.create('fakeTeamTasks'))
