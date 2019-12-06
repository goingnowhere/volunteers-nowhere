import React from 'react'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { T } from '../common/i18n'

// TODO move to react after figuring out modal strategy
const showUserProfileModal = userId =>
  AutoFormComponents.ModalShowWithTemplate(
    'noInfoUserProfile',
    { userId }, 'User Form', 'lg',
  )

export const UserListControls = ({ userId }) => (
  <button
    type="button"
    className="btn btn-light btn-sm"
    onClick={() => showUserProfileModal(userId)}
  >
    <T>user_details</T>
  </button>
)
