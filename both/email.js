import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
// import SimpleSchema from 'simpl-schema'
// import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { previewTemplate } from 'meteor/abate:email-forms'
import { Email } from 'meteor/email'
import { Volunteers } from './init'

export const EmailLogs = new Mongo.Collection('emailLogs')

export const getContext = (function getContext(cntxlist, user) {
  const context = {}
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

export const sendEmail = new ValidatedMethod({
  name: 'email.send',
  validate() { return true },
  run(user, templateName) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('unauthorized', "You don't have permission for this operation")
    }
    const doc = previewTemplate(templateName, user, getContext)
    if (doc) {
      Email.send(doc)
      EmailLogs.insert({
        userId: user._id,
        template: doc.templateId,
        sent: Date(),
      })
    }
  },
})
