import { Meteor } from 'meteor/meteor'
import React, { useCallback, useEffect, useState } from 'react'
import { SignupApproval } from 'meteor/goingnowhere:volunteers'

import { Modal } from '../common/Modal.jsx'
import { t } from '../common/i18n'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'

// Should probably be in meteor-volunteers but hooks don't work there because Meteor
export const SignupApprovalList = ({ query = {}, signups }) => {
  const [allSignups, setSignups] = useState(signups || [])
  const [modalUserId, setModalUserId] = useState('')
  const reloadSignups = useCallback(() => Meteor.call('signups.list', query, (err, signupList) => {
    if (err) {
      console.error(err)
    } else {
      setSignups(signupList)
    }
  }), [query])
  useEffect(() => {
    if (!signups) {
      reloadSignups()
    }
  }, [query, signups, reloadSignups])
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
        {allSignups.map((signup) => (
          <SignupApproval
            key={signup._id}
            signup={signup}
            openUserModal={setModalUserId}
            reloadSignups={reloadSignups}
          />
        ))}
      </ul>
    </>
  )
}
