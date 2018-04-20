import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Volunteers } from './init'

SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new Meteor.Error(error.message)
  ddpError.error = 'validation-error'
  ddpError.details = error.details
  return ddpError
})

export const EventSettings = new Mongo.Collection('settings')

const SettingsSchema = new SimpleSchema({
  eventPeriod: {
    type: new SimpleSchema({ start: Date, end: Date }),
    autoform: {
      type: 'flatpickerange',
      opts: {
        altInput: true,
        altFormat: 'F j, Y',
      },
    },
  },

  buildPeriod: {
    type: new SimpleSchema({ start: Date, end: Date }),
    autoform: {
      type: 'flatpickerange',
      opts: {
        altInput: true,
        altFormat: 'F j, Y',
      },
    },
  },
  strikePeriod: {
    type: new SimpleSchema({ start: Date, end: Date }),
    autoform: {
      type: 'flatpickerange',
      opts: {
        altInput: true,
        altFormat: 'F j, Y',
      },
    },
  },

  earlyEntryMax: {
    type: Number,
  },

  barriosArrivalDate: {
    type: Date,
    autoform: {
      type: 'flatpicker',
      opts: {
        altInput: true,
        altFormat: 'F j, Y',
      },
    },
  },
  emailVolunteers: String,
  emailNoReplay: String,
  emailTech: String,

}, { check })

EventSettings.attachSchema(SettingsSchema)

export const insertSettings = new ValidatedMethod({
  name: 'settings.insert',
  validate: SettingsSchema.validator({ clean: true }),
  run(doc) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('unauthorized', "You don't have permission for this operation")
    }
    EventSettings.insert(doc)
  },
})

export const updateMovie = new ValidatedMethod({
  name: 'settings.update',
  validate: (doc) => {
    SettingsSchema.validate(doc.modifier, { clean: true, modifier: true })
  },
  run(doc) {
    if (!Volunteers.isManager()) {
      throw new Meteor.Error('unauthorized', "You don't have permission for this operation")
    }
    // TODO: should be an upsert
    EventSettings.update(doc._id, doc.modifier)
  },
})

if (Meteor.isServer) {
  Meteor.publish('eventSettings', () => EventSettings.find({}))
}
