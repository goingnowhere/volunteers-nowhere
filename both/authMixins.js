import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Volunteers } from './init'

// TODO There's no point in this function, should just use the constructor directly
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
export const isSameUserMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(first, ...rest) {
    // if the current user is not part of noInfo, then
    // the doc must belong to the user
    if (!this.userId || (![first, first.userId, first._id].includes(this.userId))) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(first, ...rest)
  },
})

export const isSameUserOrManagerMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(first, ...rest) {
    // if the current user is not part of noInfo, then
    // the doc must belong to the user
    if (!this.userId
      || (![first, first.userId, first._id].includes(this.userId) && !Volunteers.isManager())) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(first, ...rest)
  },
})

export const isSameUserOrNoInfoMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(first, ...rest) {
    // if the current user is not part of noInfo, then
    // the doc must belong to the user
    if (!this.userId || (![first, first.userId, first._id].includes(this.userId) && !isNoInfo())) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(first, ...rest)
  },
})

export const isManagerMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(...args) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(...args)
  },
})

export const isManagerOrLeadMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(...args) {
    if (!Volunteers.isManagerOrLead()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(...args)
  },
})

export const isLoggedInMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(...args) {
    if (!this.userId) {
      throw new Meteor.Error('401', 'You need to be logged in for this operation')
    }
    return run(...args)
  },
})

export const isNoInfoMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(...args) {
    if (!isNoInfo()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(...args)
  },
})
