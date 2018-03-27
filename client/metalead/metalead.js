import { Template } from 'meteor/templating'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'

Template.metaleadDepartmentView.onCreated(function onCreated() {
  const template = this
  template.departmentId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byDepartment`, template.departmentId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byDepartment`, template.departmentId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byDepartment`, template.departmentId)
})

Template.metaleadDepartmentView.onRendered(() => {
  this.$('[data-toggle="tooltip"]').tooltip()
})

Template.metaleadDepartmentView.events({
  'click [data-action="add_team"]': (event, templateInstance) => {
    const deptId = templateInstance.departmentId
    AutoFormComponents.ModalShowWithTemplate('addTeam', { departmentId: deptId })
  },
  'click [data-action="edit_team"]': (event, templateInstance) => {
    const teamId = templateInstance.$(event.target).data('id')
    const team = Volunteers.Collections.Team.findOne(teamId)
    AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
  },
  'click [data-action="delete_team"]': (event, templateInstance) => {
    const teamId = templateInstance.$(event.target).data('id')
    // Meteor.call("remove");
  },
  'click [data-action="enroll_lead"]': (event, templateInstance) => {
    const dept = Volunteers.Collections.Department.findOne(templateInstance.departmentId)
    AutoFormComponents.ModalShowWithTemplate('allUsersTable', dept)
  },
  'click [data-action="applications"]': (event, templateInstance) => {
    const dept = Volunteers.Collections.Department.findOne(templateInstance.departmentId)
    AutoFormComponents.ModalShowWithTemplate('deptSignupsList', dept)
  },
})

Template.metaleadDepartmentView.helpers({
  leadsDept: () => Volunteers.Collections.LeadSignups.find({ status: 'confirmed', parentId: Template.instance().departmentId }),
  teamsNumber: () => {
    const deptId = Template.instance().departmentId
    return Volunteers.Collections.Team.find({ parentId: deptId }).count()
  },
  shiftsDept: () => {
    const deptId = Template.instance().departmentId
    // XXX: this helper runs more then once. I think it's a problem with the subscription
    // getting ready ...
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
  allLeads: () => {
    const deptId = Template.instance().departmentId
    // XXX: this helper runs more then once. I think it's a problem with the subscription
    // getting ready ...
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
  shiftsTeam: teamId => ({ wanted: 0, covered: 0 }),
  allTeams: () => {
    const deptId = Template.instance().departmentId
    return Volunteers.Collections.Team.find({ parentId: deptId })
  },
  allVolunteers: () => {
    const deptId = Template.instance().departmentId
    const l = Volunteers.Collections.Team.find({ parentId: deptId }).map((team) => {
      const userList = Volunteers.Collections.ShiftSignups.find({ parentId: team._id, status: 'confirmed' }).map(s => s.userId)
      if (userList) { return userList } return []
    })
    return _.chain(l).flatten().uniq().value()
  },
  leadsTeam: (team) => {
    const l = Volunteers.Collections.Lead.find({ parentId: team._id }).map((lead) => {
      const s = Volunteers.Collections.LeadSignups.findOne({ status: 'confirmed', shiftId: lead._id })
      if (s) { return _.extend(s, lead) } return _.extend(lead, { userId: null })
    })
    if (l) { return l } return []
  },
})
