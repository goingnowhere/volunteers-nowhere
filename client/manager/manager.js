import { Template } from 'meteor/templating'
import { Volunteers } from '../../both/init'

Template.managerView.onCreated(function onCreated() {
  const template = this
  template.divisionId = Volunteers.Collections.findOne({name: "NOrg 2018"})
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.Manager`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.Manager`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.Manager`)
})

Template.managerView.events({
  'click [data-action="add_department"]': (event, template) => {
    const deptId = template.divisionId
    AutoFormComponents.ModalShowWithTemplate('addDepartment', {divisionId: divisionId})
  },
  'click [data-action="edit_department"]': (event, template) => {
    const deptId = $(event.target).data('id')
    const team = Volunteers.Collections.Department.findOne(deptId)
    AutoFormComponents.ModalShowWithTemplate('deptEdit', team)
  },
  'click [data-action="delete_department"]': (event, template) => {
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

Template.managerView.helpers({
  leads: () => {
    deptIds = Volunteers.Collections.Department.find(
      {parentId: Template.instance().divisionId}).map((d) => {return d._id})
    return Volunteers.Collections.LeadSignups.find(
      {status: "confirmed", parentId: {$in: deptIds}})
  },
  metaleads: () => {
    return Volunteers.Collections.LeadSignups.find(
      {status: "confirmed", parentId: Template.instance().divisionId})
  },
  teamsNumber: (deptId) => {
    return Volunteers.Collections.Team.find({parentId: deptId}).count()
  },
  shiftsDept: (deptId) => {
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
  allLeads: (deptId) => {
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
  allTeams: (deptId) => {
    return Volunteers.Collections.Team.find({parentId: deptId})
  },
  shiftsTeam: (teamId) => {return {wanted: 0, covered: 0}},
})
