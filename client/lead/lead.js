import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'

Template.leadTeamView.onCreated(function onCreated() {
  const template = this
  template.teamId = template.data._id
  template.stats = Volunteers.teamStats(template.teamId)
  template.currentDay = new ReactiveVar(Date())
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

Template.leadTeamView.helpers({
  shiftRate: () => Template.instance().stats.shiftRate(),
  volunteerNumber: () => Template.instance().stats.volunteerNumber(),
  pendingRequests: () => Template.instance().stats.pendingRequests.length,
  team: () => Volunteers.Collections.Team.findOne(Template.instance().teamId),
  allLeads: () => Volunteers.Collections.LeadSignups.find({parentId: Template.instance().teamId}),
  currentDay: () => Template.instance().currentDay.get(),
})

Template.leadTeamView.events({
  'click [data-action="settings"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    AutoFormComponents.ModalShowWithTemplate('teamEdit', team)
  },
  'click [data-action="applications"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    AutoFormComponents.ModalShowWithTemplate('teamSignupsList', team)
  },
})
