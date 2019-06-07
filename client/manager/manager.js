import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { i18n as i18nImport } from 'meteor/universe:i18n'
import { Bert } from 'meteor/themeteorchef:bert'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'
import { EventSettings } from '../../both/collections/settings'

const callbackNotice = function callback(title, message, i18n = i18nImport) {
  return ((error) => {
    if (error) {
      Bert.alert({
        title: i18n.__('error'),
        message: error.message,
        type: 'error',
      })
    } else if (title) {
      Bert.alert({
        title: i18n.__(title),
        message: i18n.__(message),
        type: 'info',
      })
    }
  })
}

Template.managerEventSettings.onCreated(function onCreated() {
  const template = this
  template.subscribe('eventSettings')
})

Template.managerEventSettings.helpers({
  form: () => ({ collection: EventSettings }),
  data: () => (EventSettings.findOne()),
})

Template.managerUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.managerUserList.helpers({
  total_users: () => Meteor.users.find().count(),
  profile_filled: () =>
    // TODO proper subscription
    Volunteers.Collections.VolunteerForm.find().count(),
  with_duties: () =>
    // TODO aggregation
    0,
})

Template.managerUserList.events({
  'click [data-action="user_form"]': (event, template) => {
    const userId = template.$(event.currentTarget).data('userid')
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUserProfile',
      { userId }, 'User Form', 'lg',
    )
  },
})

Template.resetUserAction.events({
  'click [data-action="reset-user"]': (event, template) => {
    const { callback, user } = template.data
    Meteor.call('Accounts.resetUser', user._id, (err, res) => {
      if (callback) { callback(err, res) }
    })
  },
})

Template.shiftReviewUserAction.events({
  'click [data-action="send-review"]': (event, template) => {
    const { callback, user } = template.data
    Meteor.call('email.sendReviewNotifications', user._id, (err, res) => {
      if (callback) { callback(err, res) }
    })
  },
})

Template.managerUser.helpers({
  callbackEnrollment() {
    return callbackNotice('invitation_sent', 'invitation_sent')
  },
  callbackNotification() {
    return callbackNotice('notification_sent', 'notification_sent')
  },
  callbackReview() {
    return callbackNotice('Review sent', 'Review sent', word => word)
  },
})

Template.managerUserList.onRendered(() => {
  Pages.ManagerUserPages.requestPage(1)
})
