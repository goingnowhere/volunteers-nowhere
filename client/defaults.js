import { Meteor } from 'meteor/meteor'
import { AutoForm } from 'meteor/aldeed:autoform'
import { i18n } from 'meteor/universe:i18n'
import { Bert } from 'meteor/themeteorchef:bert'

Bert.defaults = {
  hideDelay: 4500,
  style: 'fixed-top',
  type: 'default',
}
Object.entries(Bert.icons).forEach(([key, icon]) => {
  Bert.icons[key] = icon.replace('fas ', 'fa ')
})

AutoForm.addHooks(null, {
  onError(operation, error) {
    if (Meteor.isDevelopment) console.error(error, operation)
    if (error && error.error === 409 && error.message === 'Double Booking') {
      Bert.alert({
        hideDelay: 6500,
        title: i18n.__('double_booking'),
        message: i18n.__('double_booking_msg'),
        type: 'warning',
        style: 'growl-top-right',
      })
    } else {
      Bert.alert({
        title: i18n.__('wrong_or_required_field'),
        message: error.message,
        type: 'warning',
      })
    }
  },
})
