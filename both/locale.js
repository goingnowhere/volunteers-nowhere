import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import i18n from 'meteor/universe:i18n'

export const setLocale = (locale) => {
  i18n.setLocale(locale)
  moment.locale(locale)
}

export const initLocale = (Volunteers) => {
  moment.tz.setDefault('Europe/Paris')
  Volunteers.setTimeZone('Europe/Paris')

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
