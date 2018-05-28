import { Template } from 'meteor/templating'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Session } from 'meteor/session'
import { Volunteers } from '../../both/init'

Template.metaleadDepartmentView.onCreated(function onCreated() {
  const template = this
  template.departmentId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byDepartment`, template.departmentId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.unitAggregation.byDepartment`, template.departmentId)
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
    const teamId = template.$(event.currentTarget).data('id')
    const type = template.$(event.currentTarget).data('type')
    switch (type) {
      case 'team': {
        const team = Volunteers.Collections.Team.findOne(teamId)
        AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
      }
        break
      case 'department': {
        const dept = Volunteers.Collections.Department.findOne(teamId)
        AutoFormComponents.ModalShowWithTemplate('departmentEdit', dept)
      }
        break
      default:
    }
  },
  'click [data-action="delete_team"]': (event, template) => {
    const teamId = template.$(event.currentTarget).data('id')
    Meteor.call(`${Volunteers.eventName}.Volunteers.team.remove`, teamId)
  },
  'click [data-action="enroll_lead"]': (event, template) => {
    const shiftId = template.$(event.currentTarget).data('shiftid')
    const parentId = template.$(event.currentTarget).data('parentid')
    const policy = template.$(event.currentTarget).data('policy')
    // eslint-disable-next-line meteor/no-session
    Session.set('enrollments', [])
    AutoFormComponents.ModalShowWithTemplate('leadEnrollUsersTable', {
      page: 'LeadEnrollUserSearchPages',
      data: {
        parentId, shiftId, duty: 'lead', policy,
      },
    })
  },
  'click [data-action="remove_lead"]': (event, template) => {
    const signupId = template.$(event.currentTarget).data('id')
    Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.remove`, signupId)
  },
  'click [data-action="applications"]': (event, template) => {
    const dept = Volunteers.Collections.Department.findOne(template.departmentId)
    AutoFormComponents.ModalShowWithTemplate('deptSignupsList', dept)
  },
})

Template.metaleadDepartmentView.helpers({
  dept: () => {
    const parentId = Template.instance().departmentId
    const stats = Volunteers.Collections.UnitAggregation.findOne(parentId)
    if (stats) { return stats.dept } return null
  },
  shiftsTeam: (teamId) => {
    const stats = Volunteers.Collections.UnitAggregation.findOne(teamId)
    if (stats) {
      return stats.team
    } return null
  },
  leadsDept: () => {
    const parentId = Template.instance().departmentId
    const sel = { status: 'confirmed', parentId }
    return Volunteers.Collections.LeadSignups.find(sel)
  },
  allTeams: () => {
    const parentId = Template.instance().departmentId
    const dept = Volunteers.Collections.Department.findOne(parentId)
    const teams = Volunteers.Collections.Team.find({ parentId }).fetch()
    teams.push(dept)
    return teams
  },
  leadsTeam: (team) => {
    const leadShift = Volunteers.Collections.Lead.find({ parentId: team._id })
    const leadShiftWithSignups = leadShift.map((lead) => {
      const sel = { status: 'confirmed', shiftId: lead._id }
      let leadSignup = Volunteers.Collections.LeadSignups.findOne(sel)
      if (leadSignup) {
        leadSignup = _.extend(leadSignup, { title: lead.title })
      } else {
        leadSignup = {
          title: lead.title,
          shiftId: lead._id,
          parentId: lead.parentId,
          policy: lead.policy,
          userId: null,
        }
      }
      return leadSignup
    })
    if (leadShiftWithSignups) { return leadShiftWithSignups } return []
  },
})
