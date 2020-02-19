import React, { Fragment, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import Fa from 'react-fontawesome'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Link } from 'react-router-dom'

import { Volunteers } from '../../../both/init'
import { T, t } from '../common/i18n'
import { Modal } from '../common/Modal.jsx'
import { MoveTeam } from './MoveTeam.jsx'

const leadName = (leads, userId) => {
  const { profile } = leads.find((lead) => lead._id === userId) || {}
  return profile && (profile.nickname || profile.firstName)
}

const editTeam = (team) =>
  AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
const deleteTeam = (team, reload) => {
  if (window.confirm(`Are you sure you want to delete the ${team.name} team entirely?`)) {
    Meteor.call(`${Volunteers.eventName}.Volunteers.team.remove`, team._id)
    reload()
  }
}
const removeLead = (signupId, reload) => {
  if (window.confirm('Are you sure you want to remove this lead?')) {
    Meteor.call(`${Volunteers.eventName}.Volunteers.signups.remove`, signupId)
    reload()
  }
}
const enrollLead = (teamId, shiftId, policy) =>
  AutoFormComponents.ModalShowWithTemplate('leadEnrollUsersTable', {
    page: 'LeadEnrollUserSearchPages',
    data: {
      teamId, shiftId, duty: 'lead', policy,
    },
  })

export const TeamList = ({ deptId, teams = [], reload }) => {
  const [moveTeam, setMoveTeam] = useState()

  AutoForm.addHooks([
    'InsertTeamFormId',
    'UpdateTeamFormId',
  ], {
    onSuccess() {
      reload()
      AutoFormComponents.modalHide()
    },
  })
  return (
    <Fragment>
      <Modal
        title={t('move_team')}
        isOpen={!!moveTeam}
        closeModal={() => setMoveTeam()}
      >
        <MoveTeam team={moveTeam} close={() => { setMoveTeam(); reload() }} />
      </Modal>
      <h2 className="header"><T>all_teams</T></h2>
      <table className="table">
        <thead>
          <tr>
            <th><T>name</T></th>
            <th><T>leads</T></th>
            <th><T>status</T></th>
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <th />
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team._id} className={team.leadRate.confirmed === 0 ? 'bg-warning' : ''}>
              <td>
                {team._id === deptId ? team.name : (
                  <Link to={`/lead/team/${team._id}`}>{team.name}</Link>
                )}
              </td>
              <td>
                <small>
                  <ul className="list-unstyled">
                    {team.leadRoles.map((leadRole) => (
                      <li key={leadRole._id}>
                        {leadRole.title}:
                        {leadRole.confirmed > 0 ? (
                          <Fragment>
                            {leadName(team.leads, leadRole.volunteers[0])}
                            <button
                              type="button"
                              className="btn btn-link"
                              onClick={() => removeLead(leadRole.signups[0]._id)}
                            >
                              (<T>remove</T>)
                            </button>
                          </Fragment>
                        ) : (
                          <small>
                            <button
                              type="button"
                              className="btn btn-sm btn-circle"
                              onClick={() => enrollLead(team._id, leadRole._id, leadRole.policy)}
                            >
                              <Fa name="user-plus" />
                            </button>
                          </small>
                        )}
                      </li>
                    ))}
                  </ul>
                </small>
              </td>
              <td>
                <span className="badge badge-pill badge-primary" title={`${t('confirmed')}/${t('needed')}`}>
                  {team.shiftRate && `${team.shiftRate.confirmed}/${team.shiftRate.needed}`}
                </span>
              </td>
              <td>
                <div className="btn-group inline pull-left">
                  <button
                    type="button"
                    className="btn btn-sm btn-circle"
                    onClick={() => editTeam(team)}
                    title={t('edit')}
                  >
                    <Fa name="pencil-square-o" />
                  </button>
                  {team._id !== deptId && (
                    <Fragment>
                      <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={() => setMoveTeam(team)}
                        title={t('move_team')}
                      >
                        <Fa name="arrows-alt" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={() => deleteTeam(team, reload)}
                        title={t('remove')}
                      >
                        <Fa name="trash-o" />
                      </button>
                    </Fragment>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  )
}
