import { Template } from 'meteor/templating'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Session } from 'meteor/session'
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
  'click [data-action="dept_settings"]': (event, template) => {
    const deptId = Volunteers.Collections.Department.findOne(template.data._id)
    AutoFormComponents.ModalShowWithTemplate('departmentEditDetails', deptId)
  },
  'click [data-action="add_team"]': (event, template) => {
    const deptId = template.departmentId
    AutoFormComponents.ModalShowWithTemplate('addTeam', { departmentId: deptId })
  },
  'click [data-action="edit_team"]': (event, template) => {
    const teamId = template.$(event.target).data('id')
    const team = Volunteers.Collections.Team.findOne(teamId)
    AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
  },
  'click [data-action="delete_team"]': (event, template) => {
    const teamId = template.$(event.target).data('id')
    Meteor.call(`${Volunteers.eventName}.Volunteers.team.remove`, teamId)
  },
  'click [data-action="enroll_lead"]': (event, template) => {
    const shiftId = template.$(event.target).data('shiftid')
    const parentId = template.$(event.target).data('parentid')
    // eslint-disable-next-line meteor/no-session
    Session.set(`enrollments-${shiftId}`, [])
    AutoFormComponents.ModalShowWithTemplate('allUsersTable', {
      page: 'EnrollUserSearchPages',
      data: { parentId, shiftId, duty: 'lead' },
    })
  },
  'click [data-action="remove_lead"]': (event, template) => {
    const signupId = template.$(event.target).data('id')
    Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.remove`, signupId)
  },
  'click [data-action="applications"]': (event, template) => {
    const dept = Volunteers.Collections.Department.findOne(template.departmentId)
    AutoFormComponents.ModalShowWithTemplate('deptSignupsList', dept)
  },
})

Template.metaleadDepartmentView.helpers({
  leadsDept: () =>
    Volunteers.Collections.LeadSignups.find({ status: 'confirmed', parentId: Template.instance().departmentId }),
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
    const l = Volunteers.Collections.Department.find({ _id: deptId }).fetch()
      .concat(Volunteers.Collections.Team.find({ parentId: deptId }).fetch())
      .map((team) => {
        const wanted = Volunteers.Collections.Lead.find({ parentId: team._id }).count()
        const covered = Volunteers.Collections.LeadSignups.find({ parentId: team._id, status: 'confirmed' }).count()
        return { wanted, covered }
      })
    return _.reduce(l, (s, acc) => ({
      wanted: s.wanted + acc.wanted,
      covered: s.covered + acc.covered,
    }), { wanted: 0, covered: 0 })
  },
  // TODO !!!
  shiftsTeam: teamId => ({ wanted: 0, covered: 0 }),
  allTeams: () => {
    const deptId = Template.instance().departmentId
    return Volunteers.Collections.Department.find({ _id: deptId }).fetch()
      .concat(Volunteers.Collections.Team.find({ parentId: deptId }).fetch())
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
      if (s) {
        return _.extend(s, { title: lead.title })
      }
      return {
        title: lead.title,
        shiftId: lead._id,
        parentId: lead.parentId,
        userId: null,
      }
    })
    if (l) { return l } return []
  },
})
