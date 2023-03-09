import React, { useEffect, useState } from 'react'
import { SignupApproval, useMethodCallData } from 'meteor/goingnowhere:volunteers'

import { Modal } from '../common/Modal.jsx'
import { t } from '../common/i18n'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'
import { Volunteers } from '../../../both/init'

// Should probably be in meteor-volunteers but need to figure out noinfo stuff
export const SignupApprovalList = ({ query = {}, onReload }) => {
  const [modalUserId, setModalUserId] = useState('')
  const [allSignups, isLoaded, reloadSignups] = useMethodCallData(
    `${Volunteers.eventName}.Volunteers.signups.list`,
    query,
  )
  useEffect(reloadSignups, [reloadSignups])
  const reload = () => {
    reloadSignups()
    onReload?.()
  }
  return (
    <>
      <Modal
        title={t('user_details')}
        isOpen={!!modalUserId}
        closeModal={() => setModalUserId('')}
      >
        <NoInfoUserProfile userId={modalUserId} />
      </Modal>
      <ul className="list-group">
        {isLoaded && allSignups.map((signup) => (
          <SignupApproval
            key={signup._id}
            signup={signup}
            openUserModal={setModalUserId}
            reload={reload}
          />
        ))}
      </ul>
    </>
  )
}
