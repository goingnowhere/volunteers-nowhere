import { Meteor } from 'meteor/meteor'
import React, { Fragment, useEffect, useState } from 'react'
import { SignupApproval } from 'meteor/goingnowhere:volunteers'

import { Modal } from '../common/Modal.jsx'
import { t } from '../common/i18n'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'

// Should probably be in meteor-volunteers but hooks don't work there because Meteor
export const SignupApprovalList = ({ query = {} }) => {
  const [allSignups, setSignups] = useState([])
  const [modalUserId, setModalUserId] = useState('')
  const reloadSignups = () => Meteor.call('signups.list', query, (err, signups) => {
    if (err) {
      console.error(err)
    } else {
      setSignups(signups)
    }
  })
  useEffect(() => {
    reloadSignups()
  }, [query])
  return (
    <Fragment>
      <Modal
        title={t('user_details')}
        isOpen={!!modalUserId}
        closeModal={() => setModalUserId('')}
      >
        <NoInfoUserProfile userId={modalUserId} />
      </Modal>
      <ul className="list-group">
        {allSignups.map(signup => (
          <SignupApproval
            key={signup._id}
            signup={signup}
            openUserModal={setModalUserId}
            reloadSignups={reloadSignups}
          />
        ))}
      </ul>
    </Fragment>
  )
}
