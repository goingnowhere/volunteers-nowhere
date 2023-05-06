import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Volunteers } from './init'

// TODO Used for weird package stuff. Remove when removing meteor-user-profiles
export const ValidatedMethodWithMixin = (function add(method, mixins, name) {
  if (name) { method.name = name } // optionally redefine method name
  method.mixins = mixins
  return new ValidatedMethod(method)
})

/* Check if the current user is a Manager or Volunteer part of no Info */
const isNoInfo = () => {
  return Volunteers.services.auth.isNoInfo()
}

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

export const isNoInfoMixin = ({ run, ...methodOptions }) => ({
  ...methodOptions,
  run(args) {
    if (!isNoInfo()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    return run(args)
  },
})
