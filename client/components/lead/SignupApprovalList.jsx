import React, { useState } from 'react'
import moment from 'moment-timezone'
import { SignupApproval, useMethodCallData } from 'meteor/goingnowhere:volunteers'

import { Modal } from '../common/Modal.jsx'
import { T, t } from '../common/i18n'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'
import { Volunteers } from '../../../both/init'

const SORT_OPTIONS = ['created', 'start', 'end']

// Should probably be in meteor-volunteers but need to figure out noinfo stuff
export const SignupApprovalList = ({ heading, query = {}, onReload }) => {
  const [modalUserId, setModalUserId] = useState('')
  const [sort, setSort] = useState('created')
  const [allSignups, isLoaded, reloadSignups] = useMethodCallData(
    `${Volunteers.eventName}.Volunteers.signups.list`,
    query,
  )

  const reload = () => {
    reloadSignups()
    onReload?.()
  }

  const signups = isLoaded && allSignups.sort((a, b) => {
    if (sort === 'created' || (a.type === 'lead' && b.type === 'lead')) {
      return 0
    }
    if (a.type === 'lead') return -1
    if (b.type === 'lead') return 1
    const aDate = moment(a.type === 'project' ? a[sort] : a.duty[sort])
    const bDate = moment(b.type === 'project' ? b[sort] : b.duty[sort])
    if (aDate.isSame(bDate)) return 0
    return aDate.isBefore(bDate) ? -1 : 1
  })

  return (
    <>
      <Modal
        title={t('user_details')}
        isOpen={!!modalUserId}
        closeModal={() => setModalUserId('')}
      >
        <NoInfoUserProfile userId={modalUserId} />
      </Modal>
      <h2 className="header mb-0"><T>{heading}</T></h2>
      <div className="mb-2">
        <T>sort</T>:
        <select
          className=''
          value={sort}
          onChange={(event) => {
            setSort(event.currentTarget.value)
          }}
        >
          {SORT_OPTIONS.map((opt) => <option value={opt}>{t(opt)}</option>)}
        </select>
      </div>
      <ul className="list-group">
        {isLoaded && signups.map((signup) => (
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
