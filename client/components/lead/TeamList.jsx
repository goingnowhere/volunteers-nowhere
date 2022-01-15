import React, { Fragment, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Volunteers } from '../../../both/init'
import { T, t } from '../common/i18n'
import { Modal } from '../common/Modal.jsx'
import { MoveTeam } from './MoveTeam.jsx'

const leadName = (leads, userId) => {
  const { profile } = leads.find((lead) => lead._id === userId) || {}
  return profile && (profile.nickname || profile.firstName)
}

const editTeam = (team) =>
  AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate',
    { form: { collection: Volunteers.Collections.team }, data: team }, '', 'lg')
const deleteTeam = (team, reload) => {
  if (window.confirm(`Are you sure you want to delete the ${team.name} team entirely?`)) {
    Meteor.call(`${Volunteers.eventName}.Volunteers.team.remove`, team._id)
    reload()
  }
}
const editLead = (lead) =>
  AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate',
    { form: { collection: Volunteers.Collections.lead }, data: lead }, '', 'lg')
const removeLead = (leadId, reload) => {
  if (window.confirm('Are you sure you want to remove this lead position?')) {
    Meteor.call(`${Volunteers.eventName}.Volunteers.lead.remove`, leadId)
    reload()
  }
}
const removeLeadSignup = (signupId, reload) => {
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
    <>
      <Modal
        title={t('move_team')}
        isOpen={!!moveTeam}
        closeModal={() => setMoveTeam()}
      >
        <MoveTeam
          team={moveTeam}
          close={() => {
            setMoveTeam()
            reload()
          }}
        />
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
                <ul className="list-unstyled">
                  {team.leadRoles.map((leadRole) => (
                    <li key={leadRole._id}>
                      {leadRole.confirmed === 0 && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0"
                          onClick={() => removeLead(leadRole._id)}
                        >
                          <FontAwesomeIcon icon="trash-alt" className="text-danger" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={() => editLead(leadRole)}
                      >
                        {leadRole.title}
                      </button>
                      {leadRole.confirmed > 0 ? (
                        <>
                          <span className="align-middle">
                            : {leadName(team.leads, leadRole.volunteers[0])}
                          </span>
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0"
                            onClick={() => removeLeadSignup(leadRole.signups[0]._id)}
                          >
                            (<T>remove</T>)
                          </button>
                        </>
                      ) : (
                          <>
                            :
                            <button
                              type="button"
                              className="btn btn-sm btn-circle"
                              onClick={() => enrollLead(team._id, leadRole._id, leadRole.policy)}
                            >
                              <FontAwesomeIcon icon="user-plus" />
                            </button>
                        </>
                      )}
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      onClick={() => editLead()}
                    >
                      <FontAwesomeIcon icon="plus-square" className="" />
                    </button>
                  </li>
                </ul>
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
                    <FontAwesomeIcon icon="edit" />
                  </button>
                  {team._id !== deptId && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={() => setMoveTeam(team)}
                        title={t('move_team')}
                      >
                        <FontAwesomeIcon icon="arrows-alt" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={() => deleteTeam(team, reload)}
                        title={t('remove')}
                      >
                        <FontAwesomeIcon icon="trash-alt" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
