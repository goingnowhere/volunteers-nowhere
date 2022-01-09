import React from 'react'
import Fa from 'react-fontawesome'
import { displayName } from 'meteor/abate:meteor-user-profiles'

import { T, t } from '../../common/i18n'
import { formatDateTime } from '../../common/dates'
import { ProfilePicture } from '../../common/ProfilePicture.jsx'

// TODO put this into a fork of meteor-user-profiles or abandon that module as it's too specific
export const UserListEntry = ({
  user: {
    _id,
    profile,
    status,
    emails,
    createdAt,
    additionalFields = [],
    fistRoles,
  },
  Controls,
  showUser,
}) => (
  // TODO fix the layout
  <div className="card">
    <div className="card-body pb-0">
      <div className="row">
        <div className="col-md-3 col-lg-3 " align="center">
          <ProfilePicture userId={_id} id={profile.picture} />
          <div className="row">
            <Controls userId={_id} showUser={showUser} />
          </div>
        </div>
        <div className="col">
          <table className="table table-user-information">
            <tbody>
              <tr>
                <td><T>name</T></td>
                <td>{displayName({ profile, emails })}
                  {status?.online && <span className="text-success"> <Fa name="circle" /></span>}
                </td>
              </tr>
              <tr><td><T>email</T> </td>
                <td>{emails[0].address}
                  {emails[0].verified ? (
                    <span className="text-success"><Fa name='check' /></span>
                  ) : (
                    // <!-- <a href="#" data-action="copy-link"><Fa name="clipboard" /></a> -->
                    <span
                      data-toggle="tooltip"
                      data-placement="top"
                      title={t('email_not_verified')}
                      className="text-danger"
                    >
                      <Fa name='warning' />
                    </span>
                  )}
                </td>
              </tr>
              <tr><td><T>createdAt</T></td><td>{formatDateTime(createdAt)}</td></tr>
              {status?.lastLogin && (
                <tr><td><T>last_login</T></td><td>{formatDateTime(status.lastLogin.date)}</td></tr>
              )}
              {fistRoles.length > 0 && (
                <tr>
                  <td><T>site_roles</T></td>
                  {fistRoles.map(fistRole => (
                    <td key={fistRole}>{fistRole}</td>
                  ))}
                </tr>
              )}
              {additionalFields.map(field => (
                <tr key={field}><td>{field.label}</td><td>{field.getData(_id)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)
