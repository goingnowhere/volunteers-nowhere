import { Meteor } from 'meteor/meteor'
import React, { useState, useEffect } from 'react'

import { T, t } from '../common/i18n'
import { UserListEntry } from '../lead/search/UserListEntry.jsx'
import { UserSearchList } from '../lead/search/UserSearchList.jsx'
import { UserListControls } from './UserListControls.jsx'
import { Modal } from '../common/Modal.jsx'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'

export const ManagerUserListComponent = ({
  userStats,
}) => {
  const [modalUserId, setModalUserId] = useState('')
  return (
    <div className="container-fluid">
      <Modal title={t('user_details')} isOpen={!!modalUserId} closeModal={() => setModalUserId('')}>
        <NoInfoUserProfile userId={modalUserId} />
      </Modal>
      <div className="row">
        <div className="col-md-2 bg-grey">
          <h3>NoInfo</h3>
          <div><span className="mb-2 dark-text"><T>ticket_holders</T>:</span> {userStats.ticketHolders}</div>
          <div><span className="mb-2 dark-text"><T>enrollment_sent</T>:</span> {userStats.enrollmentSent}</div>
          <div><span className="mb-2 dark-text"><T>enrolled</T>:</span> {userStats.enrollmentAck} (+ {userStats.manualRegistration})</div>
          <div><span className="mb-2 dark-text"><T>profile_filled</T>:</span> {userStats.profileFilled}</div>
          <div><span className="mb-2 dark-text"><T>with_duties</T>:</span> {userStats.withDuties}</div>
          <div><span className="mb-2 dark-text"><T>with_picture</T>:</span> {userStats.withPicture}</div>
          <div><span className="mb-2 dark-text"><T>online</T>:</span> {userStats.online}</div>
          <div><span className="mb-2 dark-text"><T>manual_registration</T>:</span> {userStats.manualRegistration}</div>
          {/* <button type="button" className="btn btn-default btn-sm" data-action="new_user">
            {{__ "new_user" }}
            </button> */}
        </div>
        <div className="col pt-2">
          <UserSearchList
            component={UserListEntry}
            Controls={UserListControls}
            showUser={userId => setModalUserId(userId)}
          />
        </div>
      </div>
    </div>
  )
}

export const ManagerUserList = () => {
  const [userStats, setStats] = useState({})
  useEffect(() => Meteor.call('users.stats', (err, res) => {
    if (err) {
      console.error(err)
    } else {
      setStats(res)
    }
  }), [])
  return (
    <ManagerUserListComponent userStats={userStats} />
  )
}
