import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'
import { UserPages } from '../../both/pages'

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

const textSearch = function(value,pages,event) {
  // let filters = pages.get("filters")
  let filters = {}
  if ((value) && (value.length > 3)) { //&& (event.keyCode == 13)) {
    filters = _.extend(_.clone(filters),
      // {"$text": {"$search": value}}
      // { "$or": [
      //   { "profile.firstName": { $regex: value } },
      //   { "profile.lastName": { $regex: value } },
        { "email.0.address": { $regex: value } },
      // ]}
    )
    console.log(filters);
    pages.set("filters",filters)
    pages.reload()
  } else if (value == '') {
    // filters = _.omit(_.clone(filters),"$text")
    filters = {}
    pages.set("filters",filters)
  }
}

Template.noInfoUserList.events({
  'click [data-action="new_user"]': (event,templateInstance) => {
    AutoFormComponents.ModalShowWithTemplate('noInfoUser',
      this, "User Form", 'lg')
  },

  'click [data-action="user_form"]': (event,templateInstance) => {
    const userId = $(event.target).data('id')
    const form = Volunteers.Collections.VolunteerForm.findOne({ userId })
    const user = Meteor.users.findOne(userId)
    const userform = { formName: 'VolunteerForm', form, user }
    AutoFormComponents.ModalShowWithTemplate('formBuilderDisplay',
      userform, "User Form", 'lg')
  },

  'keyup [name="search"]': (event, templateInstance) => {
    event.preventDefault();
    const value = event.target.value.trim()
    textSearch(value,UserPages,event)
  },

})

Template.noInfoUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
})

// Template.noInfoUser.helpers({
//   userform() {
//     const userId = Template.currentData()._id
//     const form = Volunteers.Collections.VolunteerForm.findOne({ userId })
//     const user = Meteor.users.findOne(userId)
//     return { formName: 'VolunteerForm', form, user }
//   },
// })
