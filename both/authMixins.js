import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Volunteers } from './init'

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

export const isNoInfoInMixin = function isNoInfoInMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    if ((noInfo == null) || (!Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id]))) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}
