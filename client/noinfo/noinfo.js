import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'

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

const textSearch = function(value,page,event) {
  pages = Pages[page]
  // do this if you want to comulate multuple filters
  // let filters = pages.get("filters")
  let filters = {}
  if ((value) && (value.length > 3)) { //&& (event.keyCode == 13)) {
    filters = _.extend(_.clone(filters),
      // TODO : I' really like to have full search someday ...
      // {"$text": {"$search": value}}
      { "$or": [
        { "profile.firstName": { $regex: value } },
        { "profile.lastName": { $regex: value } },
        { "emails.0.address": { $regex: value } },
      ]}
    )
    pages.set("filters",filters)
    pages.reload()
  } else if (value == '') {
    // filters = _.omit(_.clone(filters),"$text")
    filters = {}
    pages.set("filters",filters)
  }
}

Template.userSearch.events({
  'keyup [name="search"]': (event, templateInstance) => {
    event.preventDefault();
    const value = event.target.value.trim()
    const page = $(event.target).data('page')
    textSearch(value,page,event)
  },
})

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

})

Template.noInfoUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
})

Template.allUsersTableRow.events({
  'change .enroll_lead': (event,templateInstance) => {
    val = templateInstance.$('.enroll_lead:checked').val()
    const userId = $(event.target).data('userid')
    // this is the only place where I use a session variable.
    // can't find a better way
    let doc = Session.get("allUsersTableDoc")
    doc.userId = userId
    if (val == 'on') {
      Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.insert`, doc,
        function(err,res){
          if (err) {
            Meteor.throwError("enroll_lead failed")
          } else {
            Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.confirm`,res)
          }
        })
    } else {
      if (doc.shiftId) { // if shiftId exists, we remove the signup
        Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.remove`, doc.shiftId)
      }
    }
  },
})

// Template.noInfoUser.helpers({
//   userform() {
//     const userId = Template.currentData()._id
//     const form = Volunteers.Collections.VolunteerForm.findOne({ userId })
//     const user = Meteor.users.findOne(userId)
//     return { formName: 'VolunteerForm', form, user }
//   },
// })
