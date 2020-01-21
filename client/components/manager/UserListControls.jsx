import React, { Fragment } from 'react'
import Fa from 'react-fontawesome'
import { Meteor } from 'meteor/meteor'
import { T } from '../common/i18n'

// TODO Just copied over from module, need to rethink available actions
const makeManager = userId => Meteor.call('Accounts.changeUserRole', userId, 'manager')
const makeUser = userId => Meteor.call('Accounts.changeUserRole', userId, 'user')
const sendEnrollment = userId => Meteor.call('Accounts.sendEnrollment', userId)
const sendReview = userId => Meteor.call('email.sendReviewNotifications', userId)
const sendNotification = userId => Meteor.call('email.sendShiftReminder', userId)

export const UserListControls = ({ userId, showUser }) => (
  <Fragment>
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
          <button type="button" className="dropdown-item" onClick={() => sendEnrollment(userId)}>
            <Fa name="envelope" /> <T>send_invitation</T>
          </button>
        </li>
        <li className="dropdown-item">
          <button type="button" className="dropdown-item" onClick={() => sendReview(userId)}>
            <Fa name="envelope" /> Send review summary
          </button>
        </li>
        <li className="dropdown-item">
          <button type="button" className="dropdown-item" onClick={() => sendNotification(userId)}>
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
        <li className="dropdown-item">
          <button type="button" className="dropdown-item" onClick={() => makeManager(userId)}>
            <Fa name="unlock" /> <T>make_manager</T>
          </button>
        </li>
        <li className="dropdown-item">
          <button type="button" className="dropdown-item" onClick={() => makeUser(userId)}>
            <Fa name="unlock" /> <T>make_user</T>
          </button>
        </li>
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
      </ul>
    </div>
    <button
      type="button"
      className="btn btn-light btn-sm"
      onClick={() => showUser(userId)}
    >
      <T>user_details</T>
    </button>
  </Fragment>
)
