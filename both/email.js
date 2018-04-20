import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
// import SimpleSchema from 'simpl-schema'
// import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { EmailForms } from 'meteor/abate:email-forms'
import { Email } from 'meteor/email'
import { Volunteers } from './init'

// TODO add auth mixins !
export const insertEmailTemplate = new ValidatedMethod(EmailForms.insertEmailTemplate)
export const updateEmailTemplate = new ValidatedMethod(EmailForms.updateEmailTemplate)
export const removeEmailTemplate = new ValidatedMethod(EmailForms.removeEmailTemplate)

export const EmailLogs = new Mongo.Collection('emailLogs')

export const getContext = (function getContext(cntxlist, user, context = {}) {
  cntxlist.forEach((cntx) => {
    switch (cntx.name) {
      case 'VolProfile': {
        const volform = Volunteers.Collections.VolunteerForm.findOne({ userId: user._id })
        context[`${cntx.namespace}`] = {
          playaName: volform.playaName,
        }
        break
      }
      default:
    }
  })
  return context
})

export const sendWelcomeEmail = new ValidatedMethod({
  name: 'email.sendWelcome',
  validate() { return true },
  run(user) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('unauthorized', "You don't have permission for this operation")
    }
    const doc = EmailForms.previewTemplate('welcomeEmail', user, getContext)
    if (doc) {
      Email.send(doc, (err) => {
        if (!err) {
          EmailLogs.insert({
            userId: user._id,
            template: doc.templateId,
            sent: Date(),
          })
        }
      })
    }
  },
})
