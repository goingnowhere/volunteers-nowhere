import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Modal } from 'meteor/peppelg:bootstrap-3-modal'
import { Volunteers } from '../../both/init'

Template.leadTeamView.onCreated(function onCreated() {
  const template = this
  template.teamId = template.data._id
  template.stats = Volunteers.teamStats(template.teamId)
  template.currentDay = new ReactiveVar(moment())
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byTeam`, template.teamId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byTeam`, template.teamId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byTeam`, template.teamId)
  return template.autorun(() => {
    const teamShifts = Volunteers.Collections.TeamShifts.find(
      { parentId: template.teamId },
      { sort: { start: -1 }, limit: 1 },
    ).fetch()
    const currentDay =
      teamShifts.length >= 1 &&
        moment(teamShifts[0].start).format('MMMM Do YYYY')
    template.currentDay.set(currentDay)
  })
})

Template.leadTeamView.onRendered(() => {
  this.$('[data-toggle="tooltip"]').tooltip()
})

Template.leadTeamView.helpers({
  shiftRate: () => Template.instance().stats.shiftRate(),
  volunteerNumber: () => Template.instance().stats.volunteerNumber(),
  pendingRequests: () => Template.instance().stats.pendingRequests.length,
  team: () => Volunteers.Collections.Team.findOne(Template.instance().teamId),
  allLeads: () =>
    Volunteers.Collections.LeadSignups.find({ parentId: Template.instance().teamId, status: 'confirmed' }),
  currentDay: () => { Template.instance().currentDay.get() },
  updateCurrentDay: () => {
    const cd = Template.instance().currentDay
    return (day => cd.set(day))
  },
})

Template.leadTeamView.events({
  'click [data-action="team_settings"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
  },
  'click [data-action="add_shift"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    AutoFormComponents.ModalShowWithTemplate('addShift', { team })
  },
  'click [data-action="add_task"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    AutoFormComponents.ModalShowWithTemplate('addTask', { team })
  },
})

AutoForm.addHooks([
  'UpdateTeamShiftsFormId', 'InsertTeamShiftsFormId',
  'UpdateTeamTasksFormId', 'InsertTeamTasksFormId',
  'UpdateTeamFormId', 'InsertTeamFormId',
], {
  onSuccess: (formType, result) => {
    Modal.hide()
  },
})
