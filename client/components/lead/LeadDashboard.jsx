import React, { useCallback, useEffect, useRef } from 'react'
import Fa from 'react-fontawesome'
import { Link } from 'react-router-dom'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { AutoForm } from 'meteor/aldeed:autoform'
import { useMethodCallData } from 'meteor/goingnowhere:volunteers'

import { T, t } from '../common/i18n'
import { TabbedDutySummary } from './TabbedDutySummary.jsx'
import { CsvExportButton } from './CsvExportButton.jsx'
import { SignupApprovalList } from './SignupApprovalList.jsx'
import { Volunteers } from '../../../both/init'

export const LeadDashboard = ({ match: { params: { teamId } } }) => {
  const [{ team = {}, pendingRequests, volunteerNumber }, , reloadStats] = useMethodCallData(
    `${Volunteers.eventName}.Volunteers.getTeamStats`,
    { teamId },
  )

  const dutiesRef = useRef()
  const reload = useCallback(() => {
    reloadStats()
    dutiesRef.current?.()
  }, [reloadStats])

  const editTeam = () => {
    AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate',
      { form: { collection: Volunteers.collections.team }, data: team }, '', 'lg')
  }
  const addShiftGroup = () => {
    AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate',
      { form: { collection: Volunteers.collections.rotas }, data: { parentId: teamId } }, '', 'lg')
  }
  const addProject = () => {
    AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate',
      { form: { collection: Volunteers.collections.project }, data: { parentId: teamId } }, '', 'lg')
  }

  useEffect(() => {
    AutoForm.addHooks([
      'InsertTeamFormId',
      'UpdateTeamFormId',
      'InsertRotasFormId',
      'UpdateRotasFormId',
      'InsertProjectsFormId',
      'UpdateProjectsFormId',
    ], {
      onSuccess() {
        reload()
        AutoFormComponents.modalHide()
      },
    })
  }, [reload])

  return (
    <div className="container-fluid">
      <div className="row">
        <aside className="col-sm-4 col-md-2 bg-grey">
          <h3>
            {team.name}
            <small>
              <Link to={`/department/${team.parentId}/team/${teamId}`} title={t('public_link')}>
                <Fa name="link" />
              </Link>
            </small>
          </h3>
          <h5 className="mb-2 dark-text"><T>leads</T></h5>
          <ul className="pl-2">
            {team.leads && team.leads.map((lead) => (
              <li key={lead._id}>{lead.profile.nickname || lead.profile.firstName}</li>
            ))}
          </ul>
          <h5 className="mb-2 dark-text"><T>information</T></h5>
          <ul className="pl-2">
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
          <button type="button" className="btn btn-light btn-sm d-block" onClick={addShiftGroup}>
            <Fa name="wrench" /> <T>add_rota</T>
          </button>
          <button type="button" className="btn btn-light btn-sm d-block" onClick={addProject}>
            <Fa name="wrench" /> <T>add_project</T>
          </button>
          {/* <button type="button" className="btn btn-light btn-sm d-block"
            data-action="show_rota">
            <Fa name="calendar" /> <T>rota</T>
          </button> */}
          <CsvExportButton
            method="team.rota"
            buttonText="rota_export"
            filename="rota"
            methodArgs={{ parentId: teamId }}
          />
        </aside>
        {pendingRequests > 0 && (
          <div className="col-sm-8 col-md-5 pl-1 pr-1 order-md-last">
            <h2 className="header"><T>applications</T></h2>
            <SignupApprovalList query={{ parentId: teamId, status: 'pending' }} onReload={reload} />
          </div>
        )}
        <div className={`${pendingRequests > 0 ? 'col-md-5' : 'col-sm-8 col-md-10'
          } pl-0 pr-0`}
        >
          <TabbedDutySummary reloadRef={dutiesRef} teamId={teamId} />
        </div>
      </div>
    </div>
  )
}
