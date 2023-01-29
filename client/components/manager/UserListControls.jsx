import React, { useCallback } from 'react'
import Fa from 'react-fontawesome'
import { Meteor } from 'meteor/meteor'
import { T } from '../common/i18n'
import { Volunteers } from '../../../both/init'

// TODO Just copied over from module, need to rethink available actions
const sendEnrollment = userId => Meteor.call('Accounts.sendEnrollment', userId)
const sendReview = userId => Meteor.call('email.sendReviewNotifications', userId)
const sendNotification = userId => Meteor.call('email.sendShiftReminder', userId)

export const UserListControls = ({
  user,
  showUser,
  refreshSearch,
}) => {
  const addRole = useCallback((role) => (userId) => {
    Volunteers.methods.addRoleToUser.call({ userId, role })
    refreshSearch()
  }, [refreshSearch])
  const removeRole = useCallback((role) => (userId) => {
    Volunteers.methods.removeRoleFromUser.call({ userId, role })
    refreshSearch()
  }, [refreshSearch])
  return (
    <>
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-info dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <Fa name="user" /> <T>actions</T>
        </button>
        <ul className="dropdown-menu">
          <li className="dropdown-item">
            <button type="button" className="dropdown-item" onClick={() => sendEnrollment(user._id)}>
              <Fa name="envelope" /> <T>send_invitation</T>
            </button>
          </li>
          <li className="dropdown-item">
            <button type="button" className="dropdown-item" onClick={() => sendReview(user._id)}>
              <Fa name="envelope" /> Send review summary
            </button>
          </li>
          <li className="dropdown-item">
            <button type="button" className="dropdown-item" onClick={() => sendNotification(user._id)}>
              <Fa name="envelope" /> <T>end_notifications</T>
            </button>
          </li>
          {/* TODO use autoform so need to replace */}
          {/* <template name="editProfileUserAction">
          <li className="dropdown-item">
            <a data-action="edit-profile">
              <Fa name="edit" /> <T>edit_profile</T>
            </a>
          </li>
        </template> */}
          {/* <template name="editEmailUserAction">
          <li className="dropdown-item">
            <a data-action="edit-email">
              <Fa name="at" /> <T>edit_email</T>
            </a>
          </li>
        </template> */}
          {/* <template name="changePwdUserAction">
          <li className="dropdown-item">
            <a data-action="change-password">
              <Fa name="key" /> <T>change_password</T>
            </a>
          </li>
        </template> */}
          {/* <template name="banUserAction">
          <li className="dropdown-item">
            <a data-action="send-invitation">
              <Fa name="ban" /> <T>ban_user</T>
            </a>
          </li>
        </template> */}
          {/* <template name="unBanUserAction">
          <li className="dropdown-item">
            <a data-action="send-invitation">
              <Fa name="check-circle" /> <T>unban_user</T>
            </a>
          </li>
        </template> */}
          {user.fistRoles.includes('manager') ? (
            <li className="dropdown-item">
              <button type="button" className="dropdown-item" onClick={() => removeRole('manager')(user._id)}>
                <Fa name="unlock" /> <T>remove_manager</T>
              </button>
            </li>
          ) : (
            <li className="dropdown-item">
              <button type="button" className="dropdown-item" onClick={() => addRole('manager')(user._id)}>
                <Fa name="unlock" /> <T>make_manager</T>
              </button>
            </li>
          )}
          {user.fistRoles.includes('admin') ? (
            <li className="dropdown-item">
              <button type="button" className="dropdown-item" onClick={() => removeRole('admin')(user._id)}>
                <Fa name="unlock" /> <T>remove_admin</T>
              </button>
            </li>
          ) : (
            <li className="dropdown-item">
              <button type="button" className="dropdown-item" onClick={() => addRole('admin')(user._id)}>
                <Fa name="unlock" /> <T>make_admin</T>
              </button>
            </li>
          )}
        </ul>
      </div>
      <button
        type="button"
        className="btn btn-light btn-sm"
        onClick={() => showUser(user._id)}
      >
        <T>user_details</T>
      </button>
    </>
  )
}
