teams = [ 'Power', 'Build', 'NoInfo' ]

shifts =
  'Power': [
    { title: 'Power Ranger', start: Date(), end:Date(), min: 3, max: 5, priority: 'essential', policy: 'public' },
    { title: 'Power Ranger', start: Date(), end:Date(), min: 3, max: 5, priority: 'essential', policy: 'public' },
    { title: 'Slap lead', start: Date(), end:Date(), min: 1, priority: 'essential', policy: 'public' },
    { title: 'Slap lead', start: Date(), end:Date(), min: 1, priority: 'essential', policy: 'public' },
    { title: 'Sound Lead', start: Date(), end:Date(), min: 1, priority: 'essential', policy: 'public' },
    { title: 'Sound Lead', start: Date(), end:Date(), min: 1, priority: 'essential', policy: 'public' },
  ],
  'NoInfo': [
    { title: 'helper', start: Date(), end:Date(), min: 3, max: 5, priority: 'normal', policy: 'public' },
    { title: 'noinfo lead', start: Date(), end:Date(), min: 1, priority: 'essential', policy: 'public' },
  ],
  'Build': []

# XXX instead of share that is global, it should be an export ...
share.createShifts = (Volunteers) ->
  if Volunteers.Collections.TeamShifts.find().count() == 0
    for team in teams
      for doc in shifts[team]
        console.log "creating fixture for #{doc.title}"
        parentId = Volunteers.Collections.Team.findOne({name: team})._id
        doc.parentId = parentId
        id = Volunteers.Collections.TeamShifts.insert(doc)
