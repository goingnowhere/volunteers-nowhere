import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions'
checkNpmVersions { 'simpl-schema': '0.3.x' }, 'abate:meteor-user-profile'
import SimpleSchema from 'simpl-schema'
SimpleSchema.extendOptions(['autoform'])

share.Schemas = {}

share.Schemas.User = new SimpleSchema(
  emails:
    type: Array
    optional: true
  'emails.$':
    type: Object
  'emails.$.address':
    type: String
    regEx: SimpleSchema.RegEx.Email
  'emails.$.verified':
    type: Boolean
    optional: true
  createdAt:
    type: Date
    optional: true
    autoValue: () ->
      if this.isInsert then return new Date
      else this.unset()
  lastLogin:
    type: Date
    optional: true
  terms:
    type: Boolean
    defaultValue: false
    autoform:
      omit: true
  services:
    type: Object
    optional: true
    blackbox: true
  roles:
    type: Array
    optional: true
  "roles.$":
    type: Object
    optional: true
    blackbox: true
  verified:
    type: Boolean
    optional: true
    defaultValue: false
  _impersonateToken:
    type: String,
    optional: true
)

MeteorProfile = new MeteorProfileClass(share.Schemas.User)
userSchema = share.Schemas.User.extend(
  profile:
    type: MeteorProfile.Schemas.Profile
    optional: true
)
Meteor.users.attachSchema(userSchema,{replace: true})
