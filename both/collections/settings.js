import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { check } from 'meteor/check'
import i18n from 'meteor/universe:i18n'

SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new Meteor.Error(error.message)
  ddpError.error = 'validation-error'
  ddpError.details = error.details
  return ddpError
})

export const EventSettings = new Mongo.Collection('settings')

export const SettingsSchema = new SimpleSchema({
  eventName: {
    type: String,
    optional: false,
    // TODO i18n
    label: 'Event Name',
    autoform: {
      afFieldHelpText: 'For now you can\'t change this...',
      disabled: true,
    },
  },

  previousEventName: {
    type: String,
    optional: false,
    // TODO i18n
    label: 'Previous Event Name',
    autoform: {
      afFieldHelpText: 'This decides where previous volunteer lists are pulled from.'
      + ' You probably don\'t want to change this',
    },
    // TODO use rawDatabase().collections() to limit to valid names
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

  earlyEntryClose: {
    type: Date,
    autoform: {
      type: 'flatpicker',
      opts: {
        altInput: true,
        altFormat: 'F j, Y',
      },
      afFieldHelpText: 'Date after which early entry shifts can only be changed by leads',
    },
  },

  cronFrequency: {
    type: String,
    optional: true,
    label: () => i18n.__('cron_frequency'),
  },

  emailManualCheck: {
    type: Boolean,
    defaultValue: false,
    label: () => i18n.__('email_manual_check'),
  },
}, { check })

EventSettings.attachSchema(SettingsSchema)

if (Meteor.isServer) {
  Meteor.publish('eventSettings', () => EventSettings.find({}))
}
