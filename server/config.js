export const config = {
  quicketApiKey: process.env.QUICKET_API_KEY,
  quicketUserToken: process.env.QUICKET_USER_TOKEN,
  quicketEventId: process.env.QUICKET_EVENT_ID,
}

if (Meteor.isProduction) {
  const emptyKey = Object.keys(config).find(key => !config[key])
  if (emptyKey) throw new Error(`Config value ${emptyKey} is not set. Check your env vars`)
} else {
  const testConf = require('./env.json') // eslint-disable-line
  Object.keys(config).forEach((key) => {
    if (!testConf[key]) console.warn(`Config value ${key} is not set. Check your server/env.json`)
    config[key] = testConf[key]
  })
}
