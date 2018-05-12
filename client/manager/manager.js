import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Template } from 'meteor/templating'
import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'
import { EventSettings } from '../../both/settings'

// name of the organization. Nowhere is a two level hierarchy
// (departments,teams) with one top level division
const topLevelDivision = 'NOrg 2018'

Template.managerView.onCreated(function onCreated() {
  const template = this
  template.divisionId = Volunteers.Collections.Division.findOne({ name: topLevelDivision })
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.Manager`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.Manager`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.Manager`)
})

Template.managerView.onRendered(() => {
  this.$('[data-toggle="tooltip"]').tooltip()
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
  'click [data-action="applications"]': (event, template) => {
    const dept = Volunteers.Collections.Department.findOne(template.departmentId)
    AutoFormComponents.ModalShowWithTemplate('deptSignupsList', dept)
  },
})

Template.managerView.helpers({
  leads: () => {
    const sel = { parentId: Template.instance().divisionId }
    const deptIds = Volunteers.Collections.Department.find(sel).map(d => d._id)
    return Volunteers.Collections.LeadSignups.find({ status: 'confirmed', parentId: { $in: deptIds } })
  },
  metaleads: () =>
    Volunteers.Collections.LeadSignups.find({
      status: 'confirmed',
      parentId: Template.instance().divisionId,
    }),
  teamsNumber: deptId => Volunteers.Collections.Team.find({ parentId: deptId }).count(),
  shiftsDept: (deptId) => {
    const l = Volunteers.Collections.Team.find({ parentId: deptId }).map((team) => {
      const wanted = Volunteers.Collections.TeamShifts.find({ parentId: team._id }).count()
      const covered = Volunteers.Collections.ShiftSignups.find({ parentId: team._id, status: 'confirmed' }).count()
      return { wanted, covered }
    })
    return _.reduce(l, (s, acc) => ({
      wanted: s.wanted + acc.wanted,
      covered: s.covered + acc.covered,
    }), { wanted: 0, covered: 0 })
  },
  allLeads: (deptId) => {
    const l = Volunteers.Collections.Team.find({ parentId: deptId }).map((team) => {
      const wanted = Volunteers.Collections.Lead.find({ parentId: team._id }).count()
      const covered = Volunteers.Collections.LeadSignups.find({ parentId: team._id, status: 'confirmed' }).count()
      return { wanted, covered }
    })
    return _.reduce(l, (s, acc) => ({
      wanted: s.wanted + acc.wanted,
      covered: s.covered + acc.covered,
    }), { wanted: 0, covered: 0 })
  },
  allTeams: deptId => Volunteers.Collections.Team.find({ parentId: deptId }),
  shiftsTeam: teamId => ({ wanted: 0, covered: 0 }),
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

Template.managerUserList.onRendered(() => {
  Pages.ManagerUserPages.requestPage(1)
})
