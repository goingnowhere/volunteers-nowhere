import React from 'react'
import ReactModal from 'react-modal'

export const Modal = ({
  isOpen,
  closeModal,
  title,
  children,
}) => {
  ReactModal.setAppElement('#react-root')
  return (
    <ReactModal
      isOpen={isOpen}
      className="modal-dialog modal-lg"
      // We need to force Bootstrap to behave
      style={{ overlay: { zIndex: 1030, backgroundColor: '#0008', overflowY: 'auto' } }}
      onRequestClose={closeModal}
    >
      <div className="modal-content">
        <div className="modal-header">
          {title}
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">&times;</span> <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="modal-body">
          {/* Works around extra re-render when closing */}
          {isOpen && children}
        </div>
      </div>
    </ReactModal>
  )
}
