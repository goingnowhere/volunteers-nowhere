import { Meteor } from 'meteor/meteor'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Template } from 'meteor/templating'
import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'
import { EventSettings } from '../../both/collections/settings'
import { CsvExportButton } from '../components/lead/CsvExportButton.jsx'

// name of the organization. Nowhere is a two level hierarchy
// (departments,teams) with one top level division
const topLevelDivision = 'NOrg 2018'

Template.managerView.onCreated(function onCreated() {
  const template = this
  template.divisionId = Volunteers.Collections.Division.findOne({ name: topLevelDivision })
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.Manager`)
})

Template.managerView.onRendered(() => {
  this.$('[data-toggle="tooltip"]').tooltip()
})

Template.managerView.helpers({
  CsvExportButton: () => CsvExportButton,
})

Template.managerView.events({
  'click [data-action="add_department"]': (event, template) => {
    AutoFormComponents.ModalShowWithTemplate('addDepartment', { divisionId: template.divisionId })
  },
  'click [data-action="edit_department"]': (event, template) => {
    const deptId = template.$(event.currentTarget).data('id')
    const team = Volunteers.Collections.Department.findOne(deptId)
    AutoFormComponents.ModalShowWithTemplate('deptEdit', team)
  },
  'click [data-action="delete_department"]': (event, template) => {
    const teamId = template.$(event.currentTarget).data('id')
    // Meteor.call("remove");
  },
  'click [data-action="enroll_lead"]': (event, template) => {
    const dept = Volunteers.Collections.Department.findOne(template.departmentId)
    // AutoFormComponents.ModalShowWithTemplate('teamEnrollLead', dept)
  },
  'click [data-action="sync-quicket"]': () => {
    Meteor.call('ticketList.sync')
  },
})

Template.managerEventSettings.onCreated(function onCreated() {
  const template = this
  template.subscribe('eventSettings')
})

Template.managerEventSettings.helpers({
  form: () => ({ collection: EventSettings }),
  data: () => (EventSettings.findOne()),
})

Template.managerUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.managerUserList.helpers({
  total_users: () => Meteor.users.find().count(),
  profile_filled: () =>
    // TODO proper subscription
    Volunteers.Collections.VolunteerForm.find().count(),
  with_duties: () =>
    // TODO aggregation
    0,
})

Template.resetUserAction.events({
  'click [data-action="reset-user"]': (event, template) => {
    const { callback, user } = template.data
    Meteor.call('Accounts.resetUser', user._id, (err, res) => {
      if (callback) { callback(err, res) }
    })
  },
})

Template.managerUserList.onRendered(() => {
  Pages.ManagerUserPages.requestPage(1)
})
