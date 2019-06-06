import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'
import { EventSettings } from '../../both/collections/settings'

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

Template.resetUserAction.events({
  'click [data-action="reset-user"]': (event, template) => {
    const { callback, user } = template.data
    Meteor.call('Accounts.resetUser', user._id, (err, res) => {
      if (callback) { callback(err, res) }
    })
  },
})

Template.managerUserList.onRendered(() => {
  Pages.ManagerUserPages.requestPage(1)
})
