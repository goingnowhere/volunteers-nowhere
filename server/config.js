import { Meteor } from 'meteor/meteor'

export const config = {
  noonerHuntApi: process.env.NOONER_HUNT_API,
  noonerHuntKey: process.env.NOONER_HUNT_KEY,
  // quicketApiKey: process.env.QUICKET_API_KEY,
  // quicketUserToken: process.env.QUICKET_USER_TOKEN,
  // quicketEventId: process.env.QUICKET_EVENT_ID,
}
export const devConfig = Meteor.isProduction ? {} : {
  // eslint-disable-next-line global-require
  ...require('./env.json').devConfig || {},
}

if (Meteor.isProduction) {
  const emptyKey = Object.keys(config).find(key => !config[key])
  if (emptyKey) throw new Error(`Config value ${emptyKey} is not set. Check your env vars`)
} else {
  // eslint-disable-next-line global-require
  const testConf = require('./env.json')
  Object.keys(config).forEach((key) => {
    if (!testConf[key]) console.warn(`Config value ${key} is not set. Check your server/env.json`)
    config[key] = testConf[key]
  })
}
