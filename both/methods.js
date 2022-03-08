import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { isSameUserOrManagerMixin } from './authMixins'
import { MeteorProfile, Volunteers } from './init'
import { volunteerFormSchema } from './collections/users'

const userBioSchema = new SimpleSchema({
  userId: { type: String },
  ticketId: { type: Number, optional: true },
})
userBioSchema.extend(MeteorProfile.Schemas.Profile)
userBioSchema.extend(volunteerFormSchema)

export const updateUserBio = new ValidatedMethod({
  name: 'volunteerBio.update',
  mixins: [isSameUserOrManagerMixin],
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
    const selector = ticketId ? { _id: userId } : { _id: userId, ticketId: { $exists: true } }
    Meteor.users.update(selector, {
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
    Volunteers.Collections.volunteerForm.upsert({ userId }, { $set: nonProfileData })
  },
})
