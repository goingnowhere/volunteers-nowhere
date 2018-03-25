import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import SimpleSchema from 'simpl-schema'
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions'
import { MeteorProfile } from './init'

checkNpmVersions({ 'simpl-schema': '0.3.x' }, 'abate:meteor-user-profile')
SimpleSchema.extendOptions(['autoform'])

export const Schemas = {}

Schemas.User = new SimpleSchema({
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
  lastLogin: {
    type: Date,
    optional: true,
  },
  terms: {
    type: Boolean,
    defaultValue: false,
    autoform: {
      omit: true,
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
  verified: {
    type: Boolean,
    optional: true,
    defaultValue: false,
  },
  _impersonateToken: {
    type: String,
    optional: true,
  },
})

const userSchema = Schemas.User.extend({
  profile: {
    type: MeteorProfile.Schemas.Profile,
    optional: true,
  },
})
Meteor.users.attachSchema(userSchema, { replace: true })
