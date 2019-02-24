import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { check } from 'meteor/check'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import i18n from 'meteor/universe:i18n'
import { isManagerMixin } from '../authMixins'

SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new Meteor.Error(error.message)
  ddpError.error = 'validation-error'
  ddpError.details = error.details
  return ddpError
})

export const EventSettings = new Mongo.Collection('settings')

const SettingsSchema = new SimpleSchema({
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

  fistOpenDate: {
    type: Date,
    autoform: {
      type: 'flatpicker',
      opts: {
        altInput: true,
        altFormat: 'F j, Y',
      },
    },
  },

  cronFrequency: {
    type: String,
    optional: true,
    label: () => i18n.__('cron_frequency'),
  },

}, { check })

EventSettings.attachSchema(SettingsSchema)

export const insertSettings = new ValidatedMethod({
  name: 'settings.insert',
  validate: SettingsSchema.validator({ clean: true }),
  mixins: [isManagerMixin],
  run(doc) {
    EventSettings.insert(doc)
  },
})

export const updateSetting = new ValidatedMethod({
  name: 'settings.update',
  validate: (doc) => {
    SettingsSchema.validate(doc.modifier, { clean: true, modifier: true })
  },
  mixins: [isManagerMixin],
  run(doc) {
    EventSettings.update(doc._id, doc.modifier)
  },
})

if (Meteor.isServer) {
  Meteor.publish('eventSettings', () => EventSettings.find({}))
}
