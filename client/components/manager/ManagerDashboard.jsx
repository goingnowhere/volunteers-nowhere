import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { BuildAndStrikeVolunteerReport, Loading, useMethodCallData } from 'meteor/goingnowhere:volunteers'
import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { T } from '../common/i18n'
import { Modal } from '../common/Modal.jsx'
import { CsvExportButton } from '../lead/CsvExportButton.jsx'
import { Volunteers } from '../../../both/init'
import { SignupApprovalList } from '../lead/SignupApprovalList.jsx'
import { NewEvent } from './NewEvent.jsx'

// name of the organization. Nowhere is a two level hierarchy
// (departments,teams) with one top level division
const topLevelDivision = 'NOrg'

const addDepartment = (divisionId) => {
  AutoFormComponents.ModalShowWithTemplate('insertUpdateTemplate', {
    form: { collection: Volunteers.collections.department },
    data: { parentId: divisionId },
  }, '', 'lg')
}
// const syncQuicket = () => {
//   Meteor.call('ticketList.sync')
// }
const sendMassReminders = () => {
  if (window.confirm('This will send emails to everyone, even if they already got one. Continue?')) {
    Meteor.call('email.sendMassShiftReminder')
  }
}
// These were on this before but should exist on the dept rows when they exist
// 'click [data-action="edit_department"]': (event, template) => {
//   const deptId = template.$(event.currentTarget).data('id')
//   const team = Volunteers.collections.Department.findOne(deptId)
//   AutoFormComponents.ModalShowWithTemplate('deptEdit', team)
// },
// 'click [data-action="delete_department"]': (event, template) => {
//   const teamId = template.$(event.currentTarget).data('id')
//   // Meteor.call("remove");
// },
// 'click [data-action="enroll_lead"]': (event, template) => {
//   const dept = Volunteers.collections.Department.findOne(template.departmentId)
//   // AutoFormComponents.ModalShowWithTemplate('teamEnrollLead', dept)
// },
export const ManagerDashboard = () => {
  const history = useHistory()
  const [showNewEventModal, setShowNewEventModal] = useState(false)

  const { divisionId } = useTracker(() => {
    const division = Volunteers.collections.division.findOne({ name: topLevelDivision })
    return { divisionId: division?._id }
  })
  const [{ leadsStats, metaleadsStats, shiftsStats }, isLoaded] = useMethodCallData('staffing.stats', {})

  return (
    <div className="container-fluid h-100">
      <Modal
        title="Migrate teams and rotas to a new event"
        isOpen={showNewEventModal}
        closeModal={() => setShowNewEventModal(false)}
      >
        <NewEvent onSubmitted={() => {
          setShowNewEventModal(false)
          history.push('/manager/eventSettings')
        }}
        />
      </Modal>
     {!isLoaded ? <Loading /> :
      <div className="row h-100">
        <div className="col-2 bg-grey dashboard-side-panel">
          <h3><T>manager</T></h3>
          <h5 className="mb-2 dark-text"><T>leads</T></h5>
          <div data-toggle="tooltip" data-placement="top" title="{{__ wanted_covered_confirmed}}">
            occupied/total: {leadsStats.confirmed}/{leadsStats.needed}
          </div>
          <h5 className="mb-2 dark-text"><T>metalead</T></h5>
          <div data-toggle="tooltip" data-placement="top" title="{{__ wanted_covered_confirmed}}">
            occupied/total: {metaleadsStats.confirmed}/{metaleadsStats.needed}
          </div>
          <h5 className="mb-2 dark-text"><T>shifts</T></h5>
          <div data-toggle="tooltip" data-placement="top" title="{{__ wanted_covered_confirmed}}">
            booked/total: {shiftsStats.confirmed}/{shiftsStats.needed}
          </div>
          <Link to="/manager/eventSettings" className="btn btn-light btn-sm">
            <T>event_settings</T>
          </Link>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => addDepartment(divisionId)}
          >
            <T>add_department</T>
          </button>
          {/* <button type="button" className="btn btn-light btn-sm" onClick={syncQuicket}>
          Sync Quicket guestlist
        </button> */}
          <CsvExportButton method="cantina.setup" buttonText="cantina_setup_export" filename="cantina" />
          <CsvExportButton
            method="all.rota"
            buttonText="rota_export"
            filename="rota"
            methodArgs={{}}
          />
          <CsvExportButton
            method="ee.csv"
            buttonText="early_entry"
            filename="ee"
            methodArgs={{}}
          />
          <h3><T>danger_zone</T></h3>
          <button type="button" className="btn btn-light btn-sm" onClick={sendMassReminders}>
            Send Reminders to everyone
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => setShowNewEventModal(true)}
          >
            Prepare FIST for a new event
          </button>
        </div>
        <div className="col-10">
          <h2 className="header"><T>staffing_report</T>: <T>build_strike</T></h2>
          <BuildAndStrikeVolunteerReport type="build-strike" />
        </div>
      </div>
     }
    </div>
  )
}
