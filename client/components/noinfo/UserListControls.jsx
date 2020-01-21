import React from 'react'
import { T } from '../common/i18n'

export const UserListControls = ({ userId, showUser }) => (
  <button
    type="button"
    className="btn btn-light btn-sm"
    onClick={() => showUser(userId)}
  >
    <T>user_details</T>
  </button>
)
