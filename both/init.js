import { VolunteersClass } from 'meteor/abate:volunteers'
import { MeteorProfileClass } from 'meteor/abate:meteor-user-profiles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Roles } from 'meteor/piemonkey:roles'
import { moment } from 'meteor/momentjs:moment'

export const Volunteers = new VolunteersClass('nowhere2018')

const roles = ['admin', 'manager', 'user']
// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName, roles)

// establish a hierarchy among roles
if (Meteor.isServer) {
  Roles.addRolesToParent('manager', 'admin')
  Roles.addRolesToParent('user', 'manager')
}

// XXX adding the meoter timezone package for us to load all
// the timezone file (lot of useless Kb) . This can be avoided
// using the npm package
moment.tz.setDefault('Europe/Paris')
Volunteers.setTimeZone('Europe/Paris')

moment.locale('en-US')

// For some reason the default en locale has the wrong first day of the week
moment.updateLocale('en', { week: { dow: 1 } })

// default language
i18n.setLocale('en-US')

export const ValidatedMethodWithMixin = (function add(method, mixins) {
  method.mixins = mixins
  return new ValidatedMethod(method)
})

export const isManagerMixin = function isManagerMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}

export const isManagerOrLeadMixin = function isManagerOrLeadMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    if (!Volunteers.isManagerOrLead()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}

export const isLoggedInMixin = function isLoggedInMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}
