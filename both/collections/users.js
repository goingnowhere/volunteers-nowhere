import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import { MeteorProfile, Volunteers } from '../init'

SimpleSchema.extendOptions(['autoform'])

const profileSchema = MeteorProfile.Schemas.Profile
profileSchema.extend({
  // This might not be the most secure but it needs to be on profile for it to get published without
  // delay waiting for a new subscription
  formFilled: {
    type: Boolean,
    optional: true,
    defaultValue: false,
    autoform: {
      omit: true,
    },
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
  ticketId: {
    type: Number,
    optional: true,
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

export const volunteerFormQs = {
  about: 'How can you help?',
  experience: 'What experience do you have as a volunteer at burn events?',
  skills: 'What skills can you contribute?',
  quirks: 'What do you look for in a shift?',
  gender: 'Gender',
  food: 'Food preference for if we feed you on shifts',
  allergies: 'Grave Allergies',
  intolerances: 'Food Intolerances',
  medical: 'Any medical conditions you think we should be aware of?',
  languages: 'Which languages do you speak?',
  emergencyContact: 'Emergency contact information',
  anything: 'Anything Else?',
}

export const dietGroups = ['omnivore', 'vegetarian', 'vegan', 'fish']
export const allergies = ['celiac', 'shellfish', 'nuts/peanuts', 'treenuts', 'soy', 'egg']
export const intolerances = ['gluten', 'peppers', 'shellfish', 'nuts', 'egg', 'lactose', 'other']

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
    allowedValues: dietGroups,
    optional: true,
  },
  allergies: {
    type: Array,
    optional: true,
  },
  'allergies.$': {
    type: String,
    allowedValues: allergies,
  },
  intolerances: {
    type: Array,
    optional: true,
  },
  'intolerances.$': {
    type: String,
    allowedValues: intolerances,
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

volunteerFormSchema.extend(Volunteers.schemas.volunteerForm)
Volunteers.collections.volunteerForm.attachSchema(volunteerFormSchema)

export const ticketsCollection = new Mongo.Collection('tickets')
if (Meteor.isServer) {
  ticketsCollection.createIndex({ email: 1 })
}
