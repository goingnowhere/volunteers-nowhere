import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import i18n from 'meteor/universe:i18n'

const TIMEZONE = 'Europe/Paris'

export const setLocale = (locale) => {
  i18n.setLocale(locale)
  moment.locale(locale)
}

export const initLocale = (Volunteers) => {
  moment.tz.setDefault(TIMEZONE)
  Volunteers.setTimeZone(TIMEZONE)

  setLocale('en')

  // For some reason the default en locale has the wrong first day of the week
  moment.updateLocale('en', { week: { dow: 1 } })
}

export const setUserLocale = (userId) => {
  const user = Meteor.users.findOne(userId)
  if (user && user.profile) {
    setLocale(user.profile.language || 'en')
  }
}

export const setTimezoneForUpload = (date) => moment.tz(date, TIMEZONE).startOf('day').toDate()
export const dayStringFromTZDate = (date) => moment.tz(date, TIMEZONE).format('YYYY-MM-DD')
