import React from 'react'
import { displayName } from 'meteor/abate:meteor-user-profiles'

import { ProfilePicture } from '../../common/ProfilePicture.jsx'

export const EnrollListEntry = ({
  user: {
    _id,
    profile,
    emails,
  },
  Controls,
}) => (
  // TODO fix the layout
  <div className="row border-top border-bottom p-2">
    <div className="col-1 p-0">
      <ProfilePicture userId={_id} id={profile.picture} />
    </div>
    <div className="col-3">{displayName({ profile, emails })}</div>
    <div className="col-4">{emails[0].address}</div>
    <div className="col-4"><Controls userId={_id} /></div>
  </div>
)
