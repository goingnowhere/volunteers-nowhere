
require './units-fixtures'
require './duties-fixtures'
require './shifts-fixtures'
import createForm from './profile-form'

module.exports = runFixtures = (Volunteers) ->
  # XXX this should be something else. This check is a bit dangerous
  shouldRun = Volunteers.Collections.Team.find().count() == 0
  if shouldRun
    console.log 'Run fixtures'
    share.createUnits(Volunteers)
    share.createShifts(Volunteers)
    createForm(Volunteers)
