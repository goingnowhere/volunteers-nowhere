import { createUnitFixtures } from './units-fixtures'
import { createSettingFixtures, createEmailTemplateFixtures } from './settings-fixtures'
// import './duties-fixtures'
import { createShiftFixtures } from './shifts-fixtures'
import { createUserFixtures } from './users-fixtures'

export const runFixtures = (Volunteers) => {
  // XXX this should be something else. This check is a bit dangerous
  const shouldRun = Volunteers.Collections.team.find().count() === 0
  if (shouldRun) {
    console.log('Run fixtures')
    createEmailTemplateFixtures()
    const settings = createSettingFixtures()
    createUnitFixtures(Volunteers)
    createShiftFixtures(Volunteers, settings)
    createUserFixtures(Volunteers)
  }
}
