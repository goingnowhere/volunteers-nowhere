import React from 'react'
import ReactModal from 'react-modal'

import { T } from '../common/i18n'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'

export const UserProfileModal = ({
  userId,
  closeModal,
}) => {
  ReactModal.setAppElement('#react-root')
  return (
    <ReactModal
      isOpen={!!userId}
      className="modal-dialog modal-lg"
      // We need to force Bootstrap to behave
      style={{ overlay: { zIndex: 1030, backgroundColor: '#0008', overflowY: 'auto' } }}
      onRequestClose={closeModal}
    >
      <div className="modal-content">
        <div className="modal-header">
          <T>user_details</T>
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">&times;</span> <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="modal-body">
          {userId && <NoInfoUserProfile userId={userId} />}
        </div>
      </div>
    </ReactModal>
  )
}
