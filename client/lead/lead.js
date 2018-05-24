import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Session } from 'meteor/session'
import { Volunteers } from '../../both/init'

moment.tz.setDefault('Europe/Paris')

Template.leadTeamView.onCreated(function onCreated() {
  const template = this
  template.teamId = template.data._id
  template.stats = Volunteers.teamStats(template.teamId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byTeam`, template.teamId)
})

Template.leadTeamView.onRendered(() => {
  this.$('[data-toggle="tooltip"]').tooltip()
})

Template.leadTeamView.helpers({
  shiftRate: () => Template.instance().stats.shiftRate(),
  volunteerNumber: () => Template.instance().stats.volunteerNumber(),
  pendingRequests: () => Template.instance().stats.pendingRequests().length,
  team: () => Volunteers.Collections.Team.findOne(Template.instance().teamId),
  allLeads: () =>
    Volunteers.Collections.LeadSignups.find({ parentId: Template.instance().teamId, status: 'confirmed' }),
  signupListContext: () => {
    const data = Template.currentData()
    data.userInfoTemplate = 'noInfoUserProfileLink'
    return data
  },
})

Template.leadTeamView.events({
  'click [data-action="team_settings"]': (event, template) => {
    const team = Volunteers.Collections.Team.findOne(template.data._id)
    AutoFormComponents.ModalShowWithTemplate('teamEditDetails', team)
  },
  'click [data-action="add_shift"]': (event, template) => {
    const team = Volunteers.Collections.Team.findOne(template.data._id)
    AutoFormComponents.ModalShowWithTemplate('addShift', { team })
  },
  'click [data-action="add_shift_group"]': (event, template) => {
    const team = Volunteers.Collections.Team.findOne(template.data._id)
    AutoFormComponents.ModalShowWithTemplate('addShiftGroup', { parentId: team._id })
  },
  'click [data-action="add_task"]': (event, template) => {
    const team = Volunteers.Collections.Team.findOne(template.data._id)
    AutoFormComponents.ModalShowWithTemplate('addTask', { team })
  },
  'click [data-action="add_project"]': (event, template) => {
    const team = Volunteers.Collections.Team.findOne(template.data._id)
    AutoFormComponents.ModalShowWithTemplate('addProject', { team })
  },
})

Template.leadTeamTabs.onCreated(function onCreated() {
  const template = this
  template.teamId = template.data._id
  template.currentDay = new ReactiveVar()
  template.shownDay = new ReactiveVar(moment())
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byTeam`, template.teamId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byTeam`, template.teamId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.ProjectSignups.byTeam`, template.teamId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byTeam`, template.teamId)
  return template.autorun(() => {
    if (template.subscriptionsReady()) {
      const lastShift = Volunteers.Collections.TeamShifts.findOne(
        { parentId: template.teamId },
        { sort: { start: -1 }, limit: 1, reactive: false },
      )
      if (lastShift) {
        template.shownDay.set(moment(lastShift.start))
      }
    }
  })
})

Template.leadTeamTabs.helpers({
  currentDay: () => Template.instance().currentDay.get(),
  shownDay: () => Template.instance().shownDay.get(),
  updateCurrentDay: () => {
    const cd = Template.instance().currentDay
    return (day => cd.set(day))
  },
})

const enrollEvent = {
  'click [data-action="enroll"]': (event, template) => {
    const id = template.$(event.currentTarget).data('id')
    const type = template.$(event.currentTarget).data('type')
    const parentId = template.$(event.currentTarget).data('team')
    const policy = template.$(event.currentTarget).data('policy')
    switch (type) {
      case 'shift': {
        // eslint-disable-next-line meteor/no-session
        Session.set('enrollments', [])
        AutoFormComponents.ModalShowWithTemplate('shiftEnrollUsersTable', {
          page: 'ShiftEnrollUserSearchPages',
          data: {
            parentId,
            shiftId: id,
            duty: type,
            policy,
          },
        })
        break
      }
      case 'project': {
        const { start, end } = Volunteers.Collections.Projects.findOne(id)
        AutoFormComponents.ModalShowWithTemplate('projectEnrollUsersTable', {
          page: 'ProjectEnrollUserSearchPages',
          data: {
            parentId,
            shiftId: id,
            duty: type,
            policy,
            start,
            end,
          },
        })
        break
      }
      default:
    }
  },
}

Template.shiftSignupEnrollAction.events(enrollEvent)
Template.projectSignupEnrollAction.events(enrollEvent)

AutoForm.addHooks([
  'UpdateTeamShiftsFormId', 'InsertTeamShiftsFormId',
  'UpdateTeamTasksFormId', 'InsertTeamTasksFormId',
  'UpdateProjectsFormId', 'InsertProjectsFormId',
  'UpdateTeamFormId', 'InsertTeamFormId',
], {
  onSuccess: () => {
    AutoFormComponents.modalHide()
  },
})
