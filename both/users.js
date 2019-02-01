import SimpleSchema from 'simpl-schema'
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions'
import { MeteorProfile, Volunteers } from './init'

checkNpmVersions({ 'simpl-schema': '0.3.x' }, 'abate:meteor-user-profile')
SimpleSchema.extendOptions(['autoform'])

const profileSchema = MeteorProfile.Schemas.Profile
profileSchema.extend({
  // This might not be the most secure but it needs to be on profile for it to get published without
  // delay waiting for a new subscription
  formFilled: {
    type: Boolean,
    optional: true,
    defaultValue: false,
  },
})

// FIXME Should all of these be optional?
export const userSchema = new SimpleSchema({
  emails: {
    type: Array,
    optional: true,
  },
  'emails.$': {
    type: Object,
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  'emails.$.verified': {
    type: Boolean,
    optional: true,
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue() {
      if (this.isInsert) { return new Date() }
      return this.unset()
    },
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  roles: {
    type: Array,
    optional: true,
  },
  'roles.$': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  quicket: {
    type: Object,
    blackbox: true,
  },
  profile: {
    type: profileSchema,
    optional: true,
  },
  // mizzao:userstatus
  status: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  isBanned: {
    type: Boolean,
    optional: true,
    defaultValue: false,
  },
  _impersonateToken: {
    type: String,
    optional: true,
  },
})

Meteor.users.attachSchema(userSchema, { replace: true })

export const volunteerFormSchema = new SimpleSchema({
  about: {
    type: String,
    optional: true,
  },
  experience: {
    type: String,
    optional: true,
  },
  gender: {
    type: String,
    allowedValues: ['male', 'female', 'other'],
    optional: true,
  },
  food: {
    type: String,
    allowedValues: ['omnivore', 'vegetarian', 'vegan', 'fish'],
    optional: true,
  },
  allergies: {
    type: Array,
    optional: true,
  },
  'allergies.$': {
    type: String,
    allowedValues: ['celiac', 'shellfish', 'nuts/peanuts', 'treenuts', 'soy', 'egg'],
  },
  intolerances: {
    type: Array,
    optional: true,
  },
  'intolerances.$': {
    type: String,
    allowedValues: ['gluten', 'peppers', 'shellfish', 'nuts', 'egg', 'lactose', 'other'],
  },
  medical: {
    type: String,
    optional: true,
  },
  languages: {
    type: Array,
    optional: true,
  },
  'languages.$': {
    type: String,
    allowedValues: ['english', 'french', 'spanish', 'german', 'italian', 'other'],
  },
  emergencyContact: {
    type: String,
  },
  anything: {
    type: String,
    optional: true,
  },
})

volunteerFormSchema.extend(Volunteers.Schemas.VolunteerForm)
Volunteers.Collections.VolunteerForm.attachSchema(volunteerFormSchema)
