
require './units-fixtures'
require './duties-fixtures'

share.runFixtures = (Volunteers) ->
  shouldRun = Volunteers.Collections.Division.find().count() == 0
  if shouldRun
    console.log 'Run fixtures'
    share.createUnits(Volunteers)
