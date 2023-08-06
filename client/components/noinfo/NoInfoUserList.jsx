import React, { useState } from 'react'

import { t } from '../common/i18n'
import { UserListEntry } from '../lead/search/UserListEntry.jsx'
import { UserSearchList } from '../lead/search/UserSearchList.jsx'
import { UserListControls } from './UserListControls.jsx'
import { Modal } from '../common/Modal.jsx'
import { NoInfoUserProfile } from './NoInfoUserProfile.jsx'
import { UserStatsList } from './UserStatsList.jsx'

export function NoInfoUserList() {
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
        </div>
        <div className="col pt-2">
          <UserSearchList
            Component={UserListEntry}
            Controls={UserListControls}
            showUser={userId => setModalUserId(userId)}
          />
        </div>
      </div>
    </div>
  )
}
