import { AutoForm } from 'meteor/aldeed:autoform'
import { i18n } from 'meteor/universe:i18n'
import { Bert } from 'meteor/themeteorchef:bert'

Bert.defaults = {
  hideDelay: 4500,
  style: 'fixed-top',
  type: 'default',
}

AutoForm.addHooks(null, {
  onError(operation, error) {
    Bert.alert({
      title: i18n.__('wrong_or_required_field'),
      message: error.message,
      type: 'warning',
    })
  },
})
