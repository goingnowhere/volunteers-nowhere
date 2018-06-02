import SimpleSchema from 'simpl-schema'
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions'
import { MeteorProfile } from './init'

checkNpmVersions({ 'simpl-schema': '0.3.x' }, 'abate:meteor-user-profile')
SimpleSchema.extendOptions(['autoform'])

export const Schemas = {}

Schemas.User = new SimpleSchema({
  username: {
    type: String,
    optional: true,
  },
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
  // mizzao:userstatus
  status: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  verified: {
    type: Boolean,
    optional: true,
    defaultValue: false,
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

// each partecipant has a ticket
const ProfileSchema = MeteorProfile.Schemas.Profile.extend({
  ticketNumber: {
    type: String,
    defaultValue: 'Manual registration',
    autoform: { readonly: true },
  },
  nickname: {
    type: String,
    optional: true,
  },
  ticketDate: {
    type: Date,
    optional: true,
    defaultValue() { return new Date() },
    autoform: {
      omit: true,
      readonly: true,
    },
  },
  manualRegistration: {
    type: Boolean,
    defaultValue: true,
    autoform: {
      omit: true,
      readonly: true,
    },
  },
  invitationSent: {
    type: Boolean,
    defaultValue: false,
    autoform: {
      omit: true,
      readonly: true,
    },
  },
})

const userSchema = Schemas.User.extend({
  profile: {
    type: ProfileSchema,
    optional: true,
  },
})
Meteor.users.attachSchema(userSchema, { replace: true })
