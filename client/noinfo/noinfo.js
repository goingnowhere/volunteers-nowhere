import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { i18n } from 'meteor/universe:i18n'
import { Bert } from 'meteor/themeteorchef:bert'
import { Session } from 'meteor/session'
import 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'
import { NoInfoUserProfile } from '../components/noinfo/NoInfoUserProfile.jsx'
import { EnrollUserList } from '../components/lead/search/EnrollUserList.jsx'

Template.noInfoDashboard.onCreated(function onCreated() {
  const template = this
  template.subscribe(`${Volunteers.eventName}.Volunteers.team`, {})
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
    const id = template.$(event.currentTarget).data('id')
    return template.searchQuery.set({ teams: [id] })
  },
  'click [data-action="deptSwitch"]': (event, template) => {
    const id = template.$(event.currentTarget).data('id')
    return template.searchQuery.set({ departments: [id] })
  },
})

Template.noInfoUserList.onCreated(function onCreated() {
  const template = this
  template.userStats = new ReactiveVar({})
  Meteor.call('users.stats', (err, res) => {
    if (err) { console.log('error', err) }
    if (res) { template.userStats.set(res) }
  })
})

Template.noInfoUserList.helpers({
  userStats: () => Template.instance().userStats.get(),
})

const textSearch = (function textSearch(value, page) {
  const pages = Pages[page]
  // do this if you want to comulate multuple filters
  // let filters = pages.get("filters")
  let filters = {}
  if ((value) && (value.length > 3)) { // && (event.keyCode == 13)) {
    filters = _.extend(
      _.clone(filters),
      // TODO : Add a text index so we can do text search
      // {"$text": {"$search": value}}
      {
        $or: [
          { 'profile.nickname': { $regex: value, $options: 'ix' } },
          { 'profile.firstName': { $regex: value, $options: 'ix' } },
          { 'profile.lastName': { $regex: value, $options: 'ix' } },
          { 'emails.0.address': { $regex: value, $options: 'ix' } },
        ],
      },
    )
    pages.set('filters', filters)
    pages.reload()
  } else if (value === '') {
    // filters = _.omit(_.clone(filters),"$text")
    filters = {}
    pages.set('filters', filters)
    pages.reload()
  }
})

Template.userSearch.events({
  'keyup [name="search"]': (event, template) => {
    event.preventDefault()
    const value = event.currentTarget.value.trim()
    const page = template.$(event.currentTarget).data('page')
    textSearch(value, page, event)
  },
  'keyup [name="ticketNumber"]': (event, template) => {
    event.preventDefault()
    const value = event.currentTarget.value.trim()
    const page = template.$(event.currentTarget).data('page')
    const pages = Pages[page]
    let filters = {}
    filters = { ticketId: Number(value) }
    pages.set('filters', filters)
    pages.reload()
  },
})

Template.noInfoUserList.events({
  'click [data-action="new_user"]': () => {
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUser',
      this, 'User Form', 'lg',
    )
  },

  'click [data-action="user_form"]': (event, template) => {
    const userId = template.$(event.currentTarget).data('userid')
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUserProfile',
      { userId }, 'User Form', 'lg',
    )
  },
})

Template.noInfoUserProfileLink.events({
  'click [data-action="user_form"]': (event, template) => {
    const userId = template.$(event.currentTarget).data('userid')
    AutoFormComponents.ModalShowWithTemplate(
      'noInfoUserProfile',
      { userId }, 'User Form', 'lg',
    )
  },
})

Template.noInfoUser.onCreated(function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.noInfoUserProfile.helpers({
  NoInfoUserProfile: () => NoInfoUserProfile,
})

Template.noInfoUserProfileLink.onCreated(function onCreated() {
  const template = this
  const { userId } = template.data
  template.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, userId)
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
})

Template.shiftEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
Template.projectEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
Template.leadEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})

const enrollOnCreated = function onCreated() {
  const template = this
  const userId = template.data._id
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
}

Template.shiftEnrollTableRow.onCreated(enrollOnCreated)
Template.shiftEnrollTableRow.events({
  'change .enrollUser': (event, template) => {
    const val = template.$('.enrollUser:checked').val()
    const userId = template.$(event.currentTarget).data('userid')
    // eslint-disable-next-line meteor/no-session
    const enrollments = Session.get('enrollments') || []
    if (val === 'on') {
      enrollments.push({ userId })
      // eslint-disable-next-line meteor/no-session
      Session.set('enrollments', enrollments)
    } else {
      // eslint-disable-next-line meteor/no-session
      Session.set('enrollments', enrollments.filter(enroll => enroll.userId === userId))
    }
  },
})

Template.leadEnrollTableRow.onCreated(enrollOnCreated)
Template.leadEnrollTableRow.events({
  'change .enrollUser': (event, template) => {
    const val = template.$('.enrollUser:checked').val()
    const userId = template.$(event.currentTarget).data('userid')
    // we use radios. Only one lead can be set at any given time
    if (val === 'on') {
      // eslint-disable-next-line meteor/no-session
      Session.set('enrollments', [{ userId }])
    }
  },
})

Template.projectEnrollTableRow.onCreated(enrollOnCreated)
Template.projectEnrollTableRow.onRendered(function onRendered() {
  const template = this
  const opts = {
    /* wrap: true, */
    mode: 'range',
    dateFormat: 'Y-m-d',
    /* minDate: "today", */
    altFormat: 'F j, Y',
    /* defaultDate: ['2016-10-10', '2016-10-20'], */
    onValueUpdate(selectedDates, dateStr, instance) {
      // eslint-disable-next-line no-underscore-dangle
      const userId = template.$(instance._input).data('userid')
      const [start, end] = selectedDates
      // eslint-disable-next-line meteor/no-session
      const enrollments = Session.get('enrollments') || []
      const signup = { userId, start, end }
      if (selectedDates.length === 2) {
        enrollments.push(signup)
        // eslint-disable-next-line meteor/no-session
        Session.set('enrollments', enrollments)
      } else {
        // eslint-disable-next-line meteor/no-session
        Session.set('enrollments', enrollments.filter(enroll => enroll.userId === userId))
      }
    },
  }
  template.$(`#${template.data._id}`).flatpickr(opts)
})

const callbackNotice = function callback(title, message) {
  return ((error) => {
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

Template.notificationsUserAction.events({
  'click [data-action="send-notification"]': (event, template) => {
    const { callback, user } = template.data
    Meteor.call('email.sendShiftReminder', user._id, (err, res) => {
      if (callback) { callback(err, res) }
    })
  },
})

Template.noInfoUser.helpers({
  callbackEnrollment() {
    return callbackNotice('invitation_sent', 'invitation_sent')
  },
})

Template.noInfoUser.helpers({
  callbackNotification() {
    return callbackNotice('notification_sent', 'notification_sent')
  },
})

Template.noInfoUser.helpers({
  callbackRemove() {
    return callbackNotice()
  },
})
