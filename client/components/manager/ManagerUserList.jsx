import React, { useState } from 'react'

import { t } from '../common/i18n'
import { UserListEntry } from '../lead/search/UserListEntry.jsx'
import { UserSearchList } from '../lead/search/UserSearchList.jsx'
import { UserListControls } from './UserListControls.jsx'
import { Modal } from '../common/Modal.jsx'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'
import { UserStatsList } from '../noinfo/UserStatsList.jsx'

export function ManagerUserList() {
  const [modalUserId, setModalUserId] = useState('')

  return (
    <div className="container-fluid">
      <Modal title={t('user_details')} isOpen={!!modalUserId} closeModal={() => setModalUserId('')}>
        <NoInfoUserProfile userId={modalUserId} />
      </Modal>
      <div className="row">
        <div className="col-md-2 bg-grey">
          <h3>NoInfo</h3>
          <UserStatsList />
          {/* <button type="button" className="btn btn-default btn-sm" data-action="new_user">
            {{__ "new_user" }}
            </button> */}
        </div>
        <div className="col pt-2">
          <UserSearchList
            Component={UserListEntry}
            Controls={UserListControls}
            showUser={userId => setModalUserId(userId)}
            getManagerDetails
          />
        </div>
      </div>
    </div>
  )
}
