import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { MeteorProfile, Volunteers } from './init'
import { volunteerFormSchema } from './collections/users'
import { EventSettings, SettingsSchema } from './collections/settings'

const authMixins = Volunteers.services.auth.mixins

const userBioSchema = new SimpleSchema({
  userId: { type: String },
  ticketId: { type: Number, optional: true },
})
userBioSchema.extend(MeteorProfile.Schemas.Profile)
userBioSchema.extend(volunteerFormSchema)

export const updateUserBio = new ValidatedMethod({
  name: 'volunteerBio.update',
  mixins: [authMixins.isSameUserOrManager],
  validate: userBioSchema.validator(),
  run({
    userId,
    ticketId,
    firstName,
    lastName,
    nickname,
    picture,
    language,
    ...nonProfileData
  }) {
    // TODO check ticket id again
    Meteor.users.update({ _id: userId }, {
      $set: {
        profile: {
          firstName,
          lastName,
          nickname,
          language,
          picture,
          formFilled: true,
        },
        ...ticketId ? { ticketId } : {},
      },
    })
    Volunteers.collections.volunteerForm.upsert({ userId }, { $set: nonProfileData })
  },
})

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
