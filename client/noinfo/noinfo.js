import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { i18n } from 'meteor/universe:i18n'
import { Bert } from 'meteor/themeteorchef:bert'

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
  'click [data-action="teamSwitch"]': (event, template) => {
    const id = template.$(event.target).data('id')
    return template.searchQuery.set({ teams: [id] })
  },
  'click [data-action="deptSwitch"]': (event, template) => {
    const id = template.$(event.target).data('id')
    return template.searchQuery.set({ departments: [id] })
  },
})

Template.noInfoUserList.helpers({
  total_users: () => Meteor.users.find().count(),
  profile_filled: () =>
    // TODO proper subscription
    Volunteers.Collections.VolunteerForm.find().count(),
  with_duties: () =>
    // TODO aggregation
    0,

})

const textSearch = (function textSearch(value, page, event) {
  const pages = Pages[page]
  // do this if you want to comulate multuple filters
  // let filters = pages.get("filters")
  let filters = {}
  if ((value) && (value.length > 3)) { // && (event.keyCode == 13)) {
    filters = _.extend(
      _.clone(filters),
      // TODO : I' really like to have full search someday ...
      // {"$text": {"$search": value}}
      {
        $or: [
          { 'profile.firstName': { $regex: value } },
          { 'profile.lastName': { $regex: value } },
          { 'emails.0.address': { $regex: value } },
        ],
      },
    )
    pages.set('filters', filters)
    pages.reload()
  } else if (value === '') {
    // filters = _.omit(_.clone(filters),"$text")
    filters = {}
    pages.set('filters', filters)
  }
})

Template.userSearch.events({
  'keyup [name="search"]': (event, template) => {
    event.preventDefault()
    const value = event.target.value.trim()
    const page = template.$(event.target).data('page')
    textSearch(value, page, event)
  },
})

Template.noInfoUserList.events({
  'click [data-action="new_user"]': (event, template) => {
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUser',
      this, 'User Form', 'lg',
    )
  },

  'click [data-action="user_form"]': (event, template) => {
    const userId = template.$(event.target).data('userid')
    const form = Volunteers.Collections.VolunteerForm.findOne({ userId })
    const user = Meteor.users.findOne(userId)
    const userform = { formName: 'VolunteerForm', form, user }
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUserProfile',
      userform, 'User Form', 'lg',
    )
  },

})

Template.noInfoUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.noInfoUserProfile.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.allUsersTableRow.events({
  'change .enroll_lead': (event, template) => {
    const val = template.$('.enroll_lead:checked').val()
    const userId = template.$(event.target).data('userid')
    // this is the only place where I use a session variable.
    // can't find a better way
    const doc = Session.get('allUsersTableDoc')
    doc.userId = userId
    if (val === 'on') {
      Meteor.call(
        `${Volunteers.eventName}.Volunteers.leadSignups.insert`, doc,
        (err, res) => {
          if (err) {
            Meteor.throwError('enroll_lead failed')
          } else {
            Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.confirm`, res)
          }
        },
      )
    } else if (doc.shiftId) { // if shiftId exists, we remove the signup
      Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.remove`, doc.shiftId)
    }
  },
})

const callbackNotice = function callback(title, message) {
  return (function callback(error, res) {
    if (error) {
      Bert.alert({
        title: i18n.__('error'),
        message: error.message,
        type: 'error',
      })
    } else if (title) {
      Bert.alert({
        title: i18n.__(title),
        message: i18n.__(message),
        type: 'info',
      })
    }
  })
}
Template.noInfoUser.helpers({
  callbackEnrollment() {
    return callbackNotice('invitation_sent', 'invitation_sent')
  },
})

Template.noInfoUser.helpers({
  callbackRemove() {
    return callbackNotice()
  },
})
