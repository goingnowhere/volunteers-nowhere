import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { isSameUserOrManagerMixin } from './authMixins'
import { MeteorProfile, Volunteers } from './init'
import { volunteerFormSchema } from './users'

const userBioSchema = new SimpleSchema({
  userId: { type: String },
})
userBioSchema.extend(MeteorProfile.Schemas.Profile)
userBioSchema.extend(volunteerFormSchema)

export const updateUserBio = new ValidatedMethod({
  name: 'volunteerBio.update',
  mixins: [isSameUserOrManagerMixin],
  validate: userBioSchema.validator(),
  run({
    userId,
    firstName,
    lastName,
    nickname,
    picture,
    language,
    ...nonProfileData
  }) {
    Meteor.users.update({ _id: userId }, {
      $set: {
        profile: {
          firstName,
          lastName,
          nickname,
          language,
          picture,
        },
        formFilled: true,
      },
    })
    Volunteers.Collections.VolunteerForm.upsert({ userId }, { $set: nonProfileData })
  },
})
