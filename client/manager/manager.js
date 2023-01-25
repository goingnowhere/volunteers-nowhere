import { Template } from 'meteor/templating'
import { EventSettings } from '../../both/collections/settings'

Template.managerEventSettings.onCreated(function onCreated() {
  const template = this
  template.subscribe('eventSettings')
})

Template.managerEventSettings.helpers({
  form: () => ({ collection: EventSettings, omitFields: 'eventName' }),
  data: () => (EventSettings.findOne()),
})
