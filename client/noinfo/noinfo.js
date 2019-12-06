import { Template } from 'meteor/templating'
import { AutoFormComponents } from 'meteor/abate:autoform-components'

import { Volunteers } from '../../both/init'
import { NoInfoUserProfile } from '../components/noinfo/NoInfoUserProfile.jsx'
import { EnrollUserList } from '../components/lead/search/EnrollUserList.jsx'

Template.noInfoUserProfileLink.events({
  'click [data-action="user_form"]': (event, template) => {
    const userId = template.$(event.currentTarget).data('userid')
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUserProfile',
      { userId }, 'User Form', 'lg',
    )
  },
})

Template.noInfoUserProfile.helpers({
  NoInfoUserProfile: () => NoInfoUserProfile,
})

Template.noInfoUserProfileLink.onCreated(function onCreated() {
  const template = this
  const { userId } = template.data
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.shiftEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
Template.projectEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
Template.leadEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
