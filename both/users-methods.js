import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Accounts } from 'meteor/accounts-base'
import SimpleSchema from 'simpl-schema'
import { Volunteers } from './init'

export const sendEmail = new ValidatedMethod({
  name: 'Accounts.createNewUser',
  validate: new SimpleSchema({ email: String }).validator(),
  run(email, profile) {
    // TODO make it a mixin !
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('403', "You don't have permission for this operation")
    }
    const userId = Accounts.createUser({ email, profile })
    Accounts.sendEnrollmentEmail(userId)
  },
})
