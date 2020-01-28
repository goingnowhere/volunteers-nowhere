import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'
import { CsvExportButton } from '../components/lead/CsvExportButton.jsx'

Template.metaleadDepartmentView.onCreated(function onCreated() {
  const template = this
  template.departmentId = template.data._id
  template.name = new ReactiveVar()
  const deptSub = template.subscribe(`${Volunteers.eventName}.Volunteers.department`, { _id: template.data._id })
  template.subscribe(`${Volunteers.eventName}.Volunteers.Signups.byDept`, template.departmentId, 'lead')
  template.subscribe(`${Volunteers.eventName}.Volunteers.unitAggregation.byDepartment`, template.departmentId)
  template.autorun(() => {
    if (deptSub.ready()) {
      const dept = Volunteers.Collections.Department.findOne(template.data._id)
      template.name.set(dept.name)
    }
  })
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
    const team = Volunteers.Collections.Team.findOne(teamId)
    // TODO translate
    if (window.confirm(`Are you sure you want to delete the ${team.name} team entirely?`)) {
      Meteor.call(`${Volunteers.eventName}.Volunteers.team.remove`, teamId)
    }
  },
  'click [data-action="enroll_lead"]': (event, template) => {
    const shiftId = template.$(event.currentTarget).data('shiftid')
    const teamId = template.$(event.currentTarget).data('parentid')
    const policy = template.$(event.currentTarget).data('policy')
    AutoFormComponents.ModalShowWithTemplate('leadEnrollUsersTable', {
      page: 'LeadEnrollUserSearchPages',
      data: {
        teamId, shiftId, duty: 'lead', policy,
      },
    })
  },
  'click [data-action="remove_lead"]': (event, template) => {
    const signupId = template.$(event.currentTarget).data('id')
    Meteor.call(`${Volunteers.eventName}.Volunteers.signups.remove`, signupId)
  },
  // 'click [data-action="applications"]': (event, template) => {
  //   const dept = Volunteers.Collections.Department.findOne(template.departmentId)
  //   AutoFormComponents.ModalShowWithTemplate('deptSignupsList', dept)
  // },
  'click [data-action="early_entry"]': (event, template) => {
    const dept = Volunteers.Collections.Department.findOne(template.departmentId)
    AutoFormComponents.ModalShowWithTemplate('earlyEntry', dept, 'Early Entries')
  },
})

Template.metaleadDepartmentView.helpers({
  CsvExportButton: () => CsvExportButton,
  name: () => Template.instance().name.get(),
  dept: () => {
    const parentId = Template.currentData()._id
    const stats = Volunteers.Collections.UnitAggregation.findOne(parentId)
    if (stats) { return stats.dept } return null
  },
  pendingLeadRequests: () => {
    const parentId = Template.currentData()._id
    const stats = Volunteers.Collections.UnitAggregation.findOne(parentId)
    if (stats) {
      return stats.pendingLeadRequests
    } return 0
  },
  shiftsTeam: (teamId) => {
    const stats = Volunteers.Collections.UnitAggregation.findOne(teamId)
    if (stats) {
      return stats.team
    } return null
  },
  leadsDept: () => {
    const parentId = Template.currentData()._id
    const sel = { status: 'confirmed', parentId, type: 'lead' }
    return Volunteers.Collections.signups.find(sel)
  },
  allTeams: () => {
    const parentId = Template.currentData()._id
    const dept = Volunteers.Collections.Department.findOne(parentId)
    const teams = Volunteers.Collections.Team.find({ parentId }).fetch()
    teams.push(dept)
    return teams
  },
  leadsTeam: (team) => {
    if (team && team._id) {
      return Volunteers.Collections.Lead.find({ parentId: team._id })
        .map((lead) => {
          const sel = { status: 'confirmed', shiftId: lead._id, type: 'lead' }
          let leadSignup = Volunteers.Collections.signups.findOne(sel)
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
    }
    return []
  },
})
