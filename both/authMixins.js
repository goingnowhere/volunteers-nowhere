import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Match } from 'meteor/check'
import { Volunteers } from './init'

export const ValidatedMethodWithMixin = (function add(method, mixins, name) {
  if (name) { method.name = name } // optionally redefine method name
  method.mixins = mixins
  return new ValidatedMethod(method)
})

/* Check if the current user is a Manager or Volunteer part of no Info */
const isNoInfo = () => {
  const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
  return ((noInfo) && Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id]))
}

/* check if the first argument is a String and compares it with the current user Id
   Or if the first argument is an object with a field userId
   Or if the first argument is an object with a field _id  */
export const isSameUserMixin = function isSameUserMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    const currentUserId = Meteor.userId()
    const userId = args[0]
    if (Match.test(userId, String) && (currentUserId !== userId)) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    } else {
      const doc = args[0]
      if (Match.test(doc, Match.ObjectIncluding({ userId: String })) &&
          (currentUserId !== doc.userId)) {
        throw new Meteor.Error('403', "You don't have permission for this operation")
      } else if (Match.test(doc, Match.ObjectIncluding({ _id: String })) &&
            (currentUserId !== doc._id)) {
        throw new Meteor.Error('403', "You don't have permission for this operation")
      }
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}

export const isSameUserOrManagerMixin = function isSameUserMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    const currentUserId = Meteor.userId()
    const userId = args[0]
    if (!Volunteers.isManager()) {
      // if the current user is not a Manager, then
      // the doc must belong to the user
      if (Match.test(userId, String) && (currentUserId !== userId)) {
        throw new Meteor.Error('403', "You don't have permission for this operation")
      } else {
        const doc = args[0]
        if (Match.test(doc, Match.ObjectIncluding({ userId: String })) &&
            (currentUserId !== doc.userId)) {
          throw new Meteor.Error('403', "You don't have permission for this operation")
        } else if (Match.test(doc, Match.ObjectIncluding({ _id: String })) &&
              (currentUserId !== doc._id)) {
          throw new Meteor.Error('403', "You don't have permission for this operation")
        }
      }
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}

export const isSameUserOrNoInfoMixin = function isSameUserMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    const currentUserId = Meteor.userId()
    const userId = args[0]
    if (!isNoInfo()) {
      // if the current user is not part of noInfo, then
      // the doc must belong to the user
      if (Match.test(userId, String) && (currentUserId !== userId)) {
        throw new Meteor.Error('403', "You don't have permission for this operation")
      } else {
        const doc = args[0]
        if (Match.test(doc, Match.ObjectIncluding({ userId: String })) &&
            (currentUserId !== doc.userId)) {
          throw new Meteor.Error('403', "You don't have permission for this operation")
        } else if (Match.test(doc, Match.ObjectIncluding({ _id: String })) &&
              (currentUserId !== doc._id)) {
          throw new Meteor.Error('403', "You don't have permission for this operation")
        }
      }
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}

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

export const isNoInfoMixin = function isNoInfoMixin(methodOptions) {
  const runFunc = methodOptions.run
  methodOptions.run = function run(...args) {
    if (!isNoInfo()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return runFunc.call(this, ...args)
  }
  return methodOptions
}
