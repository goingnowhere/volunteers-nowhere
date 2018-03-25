import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'

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
    const id = templateInstance.$(event.target).data('id')
    return templateInstance.searchQuery.set({ teams: [id] })
  },
  'click [data-action="deptSwitch"]': (event, templateInstance) => {
    const id = templateInstance.$(event.target).data('id')
    return templateInstance.searchQuery.set({ departments: [id] })
  },
})

Template.noInfoUserList.helpers({
  'total_users': () => {
    return Meteor.users.find().count()
  },
  'profile_filled': () => {
    // TODO proper subscription
    return Volunteers.Collections.VolunteerForm.find().count()
  },
  'with_duties': () => {
    // TODO aggregation
    return 0
  }
})

Template.noInfoUserList.events({
  'click [data-action="new_user"]': () => {
    // TODO this should go in a modal
    Router.go('noInfoNewUser')
  },
})

Template.noInfoUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
})

Template.noInfoUser.helpers({
  userform() {
    const userId = Template.currentData()._id
    const form = Volunteers.Collections.VolunteerForm.findOne({ userId })
    const user = Meteor.users.findOne(userId)
    return { formName: 'VolunteerForm', form, user }
  },
})
