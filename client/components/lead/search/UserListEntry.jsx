import React from 'react'
import { UserInfoList } from 'meteor/goingnowhere:volunteers'

import { ProfilePicture } from '../../common/ProfilePicture.jsx'

// TODO put this into a fork of meteor-user-profiles or abandon that module as it's too specific
export const UserListEntry = ({
  user,
  Controls,
  showUser,
  refreshSearch,
}) => {
  return (
    <div className="card">
      <div className="card-body pb-0">
        <div className="row">
          <div className="col-md-3">
            <ProfilePicture user={user} width={96} height={96} />
            <div className="mt-2">
              <Controls user={user} showUser={showUser} refreshSearch={refreshSearch} />
            </div>
          </div>
          <div className="col">
            <UserInfoList user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
