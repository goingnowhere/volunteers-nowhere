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
  const noInfo = Volunteers.Collections.team.findOne({ name: 'NoInfo' })
  return ((noInfo) && Volunteers.auth.isLead(Meteor.userId(), noInfo._id))
}

/* check if the first argument is a String and compares it with the current user Id
   Or if the first argument is an object with a field userId
   Or if the first argument is an object with a field _id  */
export const isSameUserMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    // if the current user is not part of noInfo, then
    // the doc must belong to the user
    if (!this.userId || (![args, args.userId, args._id].includes(this.userId))) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})

export const isSameUserOrManagerMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    // if the current user is not part of noInfo, then
    // the doc must belong to the user
    if (!this.userId
      || (![args, args.userId, args._id].includes(this.userId) && !Volunteers.auth.isManager())) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})

export const isSameUserOrNoInfoMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    // if the current user is not part of noInfo, then
    // the doc must belong to the user
    if (!this.userId || (![args, args.userId, args._id].includes(this.userId) && !isNoInfo())) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})

export const isManagerMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    if (!Volunteers.auth.isManager()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})

/** If arg is a parentId or an object containing one, are we a lead of that unit or manager?
  * If we don't provide a parentId, throw unless we're a manager */
export const isLeadMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    // Check if lead of parentId from args if it has it
    const teamId = typeof args === 'object' ? args.parentId : args
    if (!Volunteers.auth.isManager(this.userId) && !Volunteers.auth.isLead(this.userId, teamId)) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})

// Specific mixin to allow any lead not just ones for a specific team
export const isAnyLeadMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    if (!Volunteers.auth.isALead(this.userId)) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})

export const isLoggedInMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    if (!this.userId) {
      throw new Meteor.Error('401', 'You need to be logged in for this operation')
    }
    return run(args)
  },
})

export const isNoInfoMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    if (!isNoInfo()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})
