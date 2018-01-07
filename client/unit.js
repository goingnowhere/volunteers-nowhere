import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'
// Below is not explicitly exported from autoform-components module, it adds it to the global scope
/* global ModalShowWithTemplate */
// import { ModalShowWithTemplate } from 'meteor/abate:autoform-components'
import { Volunteers } from '../both/init'

Template.publicDepartmentView.onCreated(function onCreated() {
  const template = this
  this.departmentId = template.data._id
  // XXX this should just fetch the teams of this dept
  template.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
})

Template.publicDepartmentView.helpers({
  teams: () => {
    const template = Template.instance()
    return Volunteers.Collections.Team.find({ parentId: template.departmentId })
  },
  canEditTeam: () => {
    const template = Template.instance()
    return Volunteers.isManagerOrLead(Meteor.userId(), [template.departmentId])
  },
})

Template.leadTeamView.onCreated(function onCreated() {
  const template = this
  template.teamId = template.data._id
  // template.sub =
  //   template.subscribe(`${Volunteers.eventName}.Volunteers.allDuties.byTeam`, template.teamId)
  template.stats = Volunteers.teamStats(template.teamId)
  template.currentDay = new ReactiveVar(Date())
  return template.autorun(() => {
    // if(template.sub.ready()) {
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
  currentDay: () => Template.instance().currentDay.get(),
})

Template.leadTeamView.events({
  'click [data-action="settings"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    ModalShowWithTemplate('teamEdit', team)
  },
  'click [data-action="applications"]': (event, templateInstance) => {
    const team = Volunteers.Collections.Team.findOne(templateInstance.data._id)
    ModalShowWithTemplate('teamSignupsList', team)
  },
})

Template.metaleadDepartmentView.onCreated(function onCreated() {
  const template = this
  const departmentId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.department`, departmentId)
})

Template.metaleadDepartmentView.events({
  'click [data-action="settings"]': (event, templateInstance) => {
    const dept = Volunteers.Collections.Department.findOne(templateInstance.data._id)
    ModalShowWithTemplate('departmentEdit', dept)
  },
  'click [data-action="applications"]': (event, templateInstance) => {
    const dept = Volunteers.Collections.Department.findOne(templateInstance.data._id)
    ModalShowWithTemplate('teamSignupsList', dept)
  },
})
