import { createUnits } from './units-fixtures'
import { createSettings, createEmailTemplates } from './settings-fixtures'
// import './duties-fixtures'
import { createShifts } from './shifts-fixtures'
import { createUsers } from './users-fixtures'

export const runFixtures = (Volunteers) => {
  // XXX this should be something else. This check is a bit dangerous
  const shouldRun = Volunteers.Collections.team.find().count() === 0
  if (shouldRun) {
    console.log('Run fixtures')
    createEmailTemplates()
    const settings = createSettings()
    createUnits(Volunteers)
    createShifts(Volunteers, settings)
    createUsers(Volunteers)
  }
}
