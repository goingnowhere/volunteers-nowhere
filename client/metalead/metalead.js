import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'

Template.metaleadDepartmentView.onCreated(function onCreated() {
  const template = this
  template.departmentId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byDepartment`, template.departmentId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byDepartment`, template.departmentId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byDepartment`, template.departmentId)
})

Template.metaleadDepartmentView.events({
  'click [data-action="add_team"]': (event, template) => {
    const deptId = template.departmentId
    AutoFormComponents.ModalShowWithTemplate('addTeam', {departmentId: deptId})
  },
  'click [data-action="edit_team"]': (event, template) => {
    const teamId = $(event.target).data('id')
    const team = Volunteers.Collections.Team.findOne(teamId)
    AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
  },
  'click [data-action="delete_team"]': (event, template) => {
    const teamId = $(event.target).data('id')
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

Template.metaleadDepartmentView.helpers({
  leadsDept: () => {
    return Volunteers.Collections.LeadSignups.find(
      {status: "confirmed", parentId: Template.instance().departmentId})
  },
  teamsNumber: () => {
    const deptId = Template.instance().departmentId;
    return Volunteers.Collections.Team.find({parentId: deptId}).count()
  },
  shiftsDept: () => {
    const deptId = Template.instance().departmentId;
    // XXX: this helper runs more then once. I think it's a problem with the subscription
    // getting ready ...
    l = Volunteers.Collections.Team.find({parentId: deptId}).map((team) => {
      wanted = Volunteers.Collections.TeamShifts.find({parentId: team._id}).count()
      covered = Volunteers.Collections.ShiftSignups.find(
        {parentId: team._id, status: "confirmed"}).count()
      return { wanted: wanted, covered: covered }
    })
    return _.reduce(l,function (s,acc) {
        return {
          wanted: s.wanted + acc.wanted,
          covered: s.covered + acc.covered
        }
      }, {wanted: 0, covered: 0}
    )
  },
  allLeads: () => {
    const deptId = Template.instance().departmentId;
    // XXX: this helper runs more then once. I think it's a problem with the subscription
    // getting ready ...
    l = Volunteers.Collections.Team.find({parentId: deptId}).map((team) => {
      wanted = Volunteers.Collections.Lead.find({parentId: team._id}).count()
      covered = Volunteers.Collections.LeadSignups.find(
        {parentId: team._id, status: "confirmed"}).count()
      return { wanted: wanted, covered: covered }
    })
    return _.reduce(l,function (s,acc) {
        return {
          wanted: s.wanted + acc.wanted,
          covered: s.covered + acc.covered
        }
      }, {wanted: 0, covered: 0}
    )
  },
  shiftsTeam: (teamId) => {return {wanted: 0, covered: 0}},
  allTeams: () => {
    const deptId = Template.instance().departmentId;
    return Volunteers.Collections.Team.find({parentId: deptId})
  },
  leadsTeam: (team) => {
    return Volunteers.Collections.LeadSignups.find(
      {status: "confirmed", parentId: team._id}).fetch()
  },
})
