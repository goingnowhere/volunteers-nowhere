import React from 'react'
import { displayName } from 'meteor/goingnowhere:volunteers'

import { ProfilePicture } from '../../common/ProfilePicture.jsx'

export const EnrollListEntry = ({
  user,
  refreshSearch,
  Controls,
}) => {
  const {
    _id,
    profile,
  } = user
  return (
  // TODO fix the layout
    <div className="row border-top border-bottom p-2">
      <div className="col-1 p-0">
        <ProfilePicture userId={_id} id={profile.picture} />
      </div>
      <div className="col-3">{displayName(user)}</div>
      <div className="col-4"><small>({profile.firstName} {profile.lastName})</small></div>
      <div className="col-4"><Controls userId={_id} refreshSearch={refreshSearch} /></div>
    </div>
  )
}
