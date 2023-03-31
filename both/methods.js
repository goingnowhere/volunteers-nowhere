import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Volunteers } from './init'
import { EventSettings, SettingsSchema } from './collections/settings'

const authMixins = Volunteers.services.auth.mixins

export const fetchSettings = new ValidatedMethod({
  name: 'settings.fetch',
  validate: null,
  mixins: [],
  run() {
    return EventSettings.findOne()
  },
})

export const insertSettings = new ValidatedMethod({
  name: 'settings.insert',
  validate: SettingsSchema.validator({ clean: true }),
  mixins: [authMixins.isManager],
  run(doc) {
    EventSettings.insert(doc)
  },
})

export const updateSettings = new ValidatedMethod({
  name: 'settings.update',
  validate: (doc) => {
    SettingsSchema.validate(doc.modifier, { clean: true, modifier: true })
  },
  mixins: [authMixins.isManager],
  run(doc) {
    EventSettings.update(doc._id, doc.modifier)
  },
})
