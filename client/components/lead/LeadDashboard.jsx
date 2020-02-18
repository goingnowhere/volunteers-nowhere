import { Meteor } from 'meteor/meteor'
import React, { useEffect, useState } from 'react'
import Fa from 'react-fontawesome'
import { Link } from 'react-router-dom'
import { AutoFormComponents } from 'meteor/abate:autoform-components'

import { T, t } from '../common/i18n'
import { TabbedDutySummary } from './TabbedDutySummary.jsx'
import { CsvExportButton } from './CsvExportButton.jsx'
import { SignupApprovalList } from './SignupApprovalList.jsx'
import { Volunteers } from '../../../both/init'

export const LeadDashboard = ({ match: { params: { teamId } } }) => {
  const [{ team, pendingRequests, volunteerNumber }, setStats] = useState({ team: {} })

  const editTeam = () => {
    AutoFormComponents.ModalShowWithTemplate('teamEditDetails', team)
  }
  const addShiftGroup = () => {
    AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate',
      { form: { collection: Volunteers.Collections.rotas }, data: { parentId: teamId } }, '', 'lg')
  }
  const addProject = () => {
    AutoFormComponents.ModalShowWithTemplate('addProject', { team })
  }
  useEffect(() => Meteor.call(`${Volunteers.eventName}.Volunteers.getTeamStats`, { teamId }, (err, teamStats) => {
    if (err) console.error(err)
    else {
      setStats(teamStats)
    }
  }), [teamId])
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 bg-grey">
          <h3>
            { team.name }
            <small>
              <Link to={`/department/${team.parentId}/team/${teamId}`} title={t('public_link')}>
                <Fa name="link" />
              </Link>
            </small>
          </h3>
          <h5 className="mb-2 dark-text"><T>leads</T></h5>
          <ul>
            {team.leads && team.leads.map((lead) => (
              <li key={lead._id}>{lead.profile.nickname || lead.profile.firstName}</li>
            ))}
          </ul>
          <h5 className="mb-2 dark-text"><T>information</T></h5>
          <ul>
            <li>
              <div title={`${t('confirmed')}/${t('needed')}`}>
                <T>shifts</T>: {team.shiftRate && `${team.shiftRate.confirmed}/${team.shiftRate.needed}`}
              </div>
            </li>
            <li>
              <div title={t('volunteers')}>
                <T>volunteers</T>: {volunteerNumber}
              </div>
            </li>
            <li>
              <div title={t('pending_requests')}>
                <T>pending_requests</T>: {pendingRequests}
              </div>
            </li>
          </ul>
          <button type="button" className="btn btn-light btn-sm d-block" onClick={editTeam}>
            <Fa name="wrench" /> <T>team_settings</T>
          </button>
          {/* <!-- <button type="button" className="btn btn-light btn-sm"
            data-id="{{_id}}" data-action="add_shift">
            <Fa name="wrench" /> <T>add_shift</T>
          </button> --> */}
          <button type="button" className="btn btn-light btn-sm d-block" onClick={addShiftGroup}>
            <Fa name="wrench" /> <T>add_rota</T>
          </button>
          {/* <!-- <button type="button" className="btn btn-light btn-sm"
            data-id="{{_id}}" data-action="add_task">
            <Fa name="wrench" /> <T>add_task</T>
          </button> --> */}
          <button type="button" className="btn btn-light btn-sm d-block" onClick={addProject}>
            <Fa name="wrench" /> <T>add_project</T>
          </button>
          {/* <button type="button" className="btn btn-light btn-sm d-block"
            data-action="show_rota">
            <Fa name="calendar" /> <T>rota</T>
          </button> */}
          <CsvExportButton method="team.rota" buttonText="rota_export" filename="rota" parentId={teamId} />
        </div>
        <div className={`${
          pendingRequests > 0 ? 'col-sm-12 col-md-5 pr-1' : 'col-sm-6 col-md-10'
        } pl-1 user-top`}
        >
          <TabbedDutySummary teamId={teamId} />
        </div>
        {pendingRequests > 0 && (
          <div className="col-sm-12 col-md-5 pl-1 user-top">
            <h2 className="header"><T>applications</T></h2>
            <SignupApprovalList query={{ parentId: teamId, status: 'pending' }} />
          </div>
        )}
      </div>
    </div>
  )
}
