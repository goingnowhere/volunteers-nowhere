
require './units-fixtures'
require './duties-fixtures'
import createForm from './profile-form'

share.runFixtures = (Volunteers) ->
  # XXX this should be something else. This check is a bit dangerous
  shouldRun = Volunteers.Collections.Division.find().count() == 0
  if shouldRun
    console.log 'Run fixtures'
    share.createUnits(Volunteers)
    createForm(Volunteers)
