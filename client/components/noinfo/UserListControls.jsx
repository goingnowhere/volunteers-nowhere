import React from 'react'
import { T } from '../common/i18n'

export const UserListControls = ({ user, showUser }) => (
  <button
    type="button"
    className="btn btn-light btn-sm"
    onClick={() => showUser(user._id)}
  >
    <T>user_details</T>
  </button>
)
