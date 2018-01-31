import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Template } from 'meteor/templating'
import { Volunteers } from '../../both/init'

Template.managerView.onCreated(function onCreated() {
  const template = this
  template.divisionId = Volunteers.Collections.Division.findOne({ name: 'NOrg 2018' })
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.Manager`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.Manager`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.Manager`)
})

Template.managerView.onRendered(() => {
  this.$('[data-toggle="tooltip"]').tooltip()
})

Template.managerView.events({
  'click [data-action="add_department"]': (event, templateInstance) => {
    const divisionId = templateInstance.divisionId
    AutoFormComponents.ModalShowWithTemplate('addDepartment', { divisionId })
  },
  'click [data-action="edit_department"]': (event, templateInstance) => {
    const deptId = templateInstance.$(event.target).data('id')
    const team = Volunteers.Collections.Department.findOne(deptId)
    AutoFormComponents.ModalShowWithTemplate('deptEdit', team)
  },
  'click [data-action="delete_department"]': (event, templateInstance) => {
    const teamId = templateInstance.$(event.target).data('id')
    // Meteor.call("remove");
  },
  'click [data-action="enroll_lead"]': (event, templateInstance) => {
    const dept = Volunteers.Collections.Department.findOne(templateInstance.departmentId)
    // AutoFormComponents.ModalShowWithTemplate('teamEnrollLead', dept)
  },
  'click [data-action="applications"]': (event, templateInstance) => {
    const dept = Volunteers.Collections.Department.findOne(templateInstance.departmentId)
    AutoFormComponents.ModalShowWithTemplate('deptSignupsList', dept)
  },
})

Template.managerView.helpers({
  leads: () => {
    const deptIds = Volunteers.Collections.Department.find({ parentId: Template.instance().divisionId }).map(d => d._id)
    return Volunteers.Collections.LeadSignups.find({ status: 'confirmed', parentId: { $in: deptIds } })
  },
  metaleads: () => Volunteers.Collections.LeadSignups.find({ status: 'confirmed', parentId: Template.instance().divisionId }),
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
