import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { $ } from 'meteor/jquery'
import { Volunteers } from '../../both/init'

let template

Template.noInfoDashboard.onCreated(function onCreated() {
  const template = this
  template.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
  template.currentDay = new ReactiveVar()
  template.searchQuery = new ReactiveVar({})
  // template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byDepartment`, departmentId)
})

Template.noInfoDashboard.helpers({
  allTeams: () => Volunteers.Collections.Team.find(),
  allDepartments: () => Volunteers.Collections.Department.find(),
  searchQuery: () => Template.instance().searchQuery,
})

Template.noInfoDashboard.events({
  'click [data-action="teamSwitch"]': (event, templateInstance) => {
    const id = $(event.target).data('id')
    return templateInstance.searchQuery.set({ teams: [id] })
  },
  'click [data-action="deptSwitch"]': (event, templateInstance) => {
    const id = $(event.target).data('id')
    return templateInstance.searchQuery.set({ departments: [id] })
  },
})
