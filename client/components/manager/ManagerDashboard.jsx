import { Meteor } from 'meteor/meteor'
import React from 'react'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Link } from 'react-router-dom'

import { T } from '../common/i18n'
import { CsvExportButton } from '../lead/CsvExportButton.jsx'
import { JsonExportButton } from '../lead/JsonExportButton.jsx'
import { Volunteers } from '../../../both/init'
import { SignupApprovalList } from '../lead/SignupApprovalList.jsx'

// name of the organization. Nowhere is a two level hierarchy
// (departments,teams) with one top level division
const topLevelDivision = 'NOrg 2018'

const addDepartment = () => {
  const { _id: divisionId } = Volunteers.Collections.division.findOne({ name: topLevelDivision })
  AutoFormComponents.ModalShowWithTemplate('addDepartment', { divisionId })
}
const syncQuicket = () => {
  Meteor.call('ticketList.sync')
}
const sendMassReminders = () => {
  if (window.confirm('This will send emails to everyone, even if they already got one. Continue?')) {
    Meteor.call('email.sendMassShiftReminder')
  }
}
// These were on this before but should exist on the dept rows when they exist
// 'click [data-action="edit_department"]': (event, template) => {
//   const deptId = template.$(event.currentTarget).data('id')
//   const team = Volunteers.Collections.Department.findOne(deptId)
//   AutoFormComponents.ModalShowWithTemplate('deptEdit', team)
// },
// 'click [data-action="delete_department"]': (event, template) => {
//   const teamId = template.$(event.currentTarget).data('id')
//   // Meteor.call("remove");
// },
// 'click [data-action="enroll_lead"]': (event, template) => {
//   const dept = Volunteers.Collections.Department.findOne(template.departmentId)
//   // AutoFormComponents.ModalShowWithTemplate('teamEnrollLead', dept)
// },
export const ManagerDashboard = () => (
  <div className="container-fluid h-100">
    <div className="row h-100">
      <div className="col-md-2 bg-grey">
        <h3><T>manager</T></h3>
        <h5 className="mb-2 dark-text"><T>leads</T></h5>
        <div data-toggle="tooltip" data-placement="top" title="{{__ wanted_covered_confirmed}}">
          occupied/total
        </div>
        <h5 className="mb-2 dark-text"><T>metalead</T></h5>
        <div data-toggle="tooltip" data-placement="top" title="{{__ wanted_covered_confirmed}}">
          occupied/total
        </div>
        <h5 className="mb-2 dark-text"><T>shifts</T></h5>
        <div data-toggle="tooltip" data-placement="top" title="{{__ wanted_covered_confirmed}}">
          booked/total
        </div>
        <Link to="/manager/eventSettings" className="btn btn-light btn-sm">
          <T>event_settings</T>
        </Link>
        <button type="button" className="btn btn-light btn-sm" onClick={addDepartment}>
          <T>add_department</T>
        </button>
        <button type="button" className="btn btn-light btn-sm" onClick={syncQuicket}>
          Sync Quicket guestlist
        </button>
        <CsvExportButton method="cantina.setup" buttonText="cantina_setup_export" filename="cantina" />
        <JsonExportButton
          method="rota.all.export"
          buttonText="rota_all_export"
          filename="rotas"
          // Hack to avoid having to make a form, etc.
          methodArgs={{ eventName: 'nowhere2020' }}
        />
        <button type="button" className="btn btn-light btn-sm" onClick={sendMassReminders}>
          Send Reminders to everyone
        </button>
      </div>
      <div className="col-md-5">
        <h2 className="header"><T>departments</T></h2>
        {/* {{> departmentsList }} */}
        <h2 className="header"><T>teams</T></h2>
        {/* {{> teamsList}} */}
      </div>
      <div className="col-md-5">
        <h2 className="header"><T>pending_metalead_requests</T></h2>
        <SignupApprovalList query={{ type: 'lead', status: 'pending' }} />
      </div>
    </div>
  </div>
)
