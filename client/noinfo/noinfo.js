import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { i18n } from 'meteor/universe:i18n'
import { Bert } from 'meteor/themeteorchef:bert'
import { Session } from 'meteor/session'
import { SpacebarsCompiler } from 'meteor/spacebars-compiler'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

import { Volunteers } from '../../both/init'
import { Pages } from '../../both/pages'

const applyContext = (function applyContext(body, context) {
  const compiled = SpacebarsCompiler.compile(body, { isBody: true })
  const content = Blaze.toHTML(Blaze.With(context, eval(compiled)))
  return content
})

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
  'change [name="terms"]': (event, template) => {
    event.preventDefault()
    const value = event.currentTarget.checked
    const page = template.$(event.currentTarget).data('page')
    const pages = Pages[page]
    let filters = {}
    filters = { 'profile.terms': value }
    pages.set('filters', filters)
    pages.reload()
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
    const userId = template.$(event.currentTarget).data('userid')
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

/* Template.noInfoUserProfile.events({
  'click [data-action=copy-enrollment]': (event, template) => {
    event.preventDefault()
    Accounts.urls.enrollAccount(token)
    event.clipboardData.setData('text/plain', link)
  },
}) */

const enrollEventCall = (function enrollEventCall(doc, enrollment) {
  const { duty, policy, ...rest } = doc
  const insert = { ...rest, ...enrollment, enrolled: true }
  Meteor.call(
    `${Volunteers.eventName}.Volunteers.${duty}Signups.insert`, insert,
    (err, signupId) => {
      if (err) {
        switch (err.error) {
          case 409:
            Bert.alert({
              hideDelay: 6500,
              title: i18n.__('abate:volunteers', 'double_booking'),
              /* XXX: add details of the other bookings stored in err.details */
              /* message: applyContext(templatebody, err),  */
              message: i18n.__('abate:volunteers', 'double_booking_msg'),
              type: 'warning',
              style: 'growl-top-right',
            })
            break
          default:
            Bert.alert({
              hideDelay: 6500,
              title: i18n.__('abate:volunteers', 'error'),
              message: err.reason,
              type: 'danger',
              style: 'growl-top-right',
            })
        }
      } if (signupId && (policy === 'requireApproval' || policy === 'adminOnly')) {
        if (duty === 'lead') {
          Meteor.call(`${Volunteers.eventName}.Volunteers.leadSignups.confirm`, signupId)
        } else {
          Meteor.call(`${Volunteers.eventName}.Volunteers.${duty}Signups.update`, {
            _id: signupId,
            modifier: {
              $set: {
                status: 'confirmed',
              },
            },
          })
        }
      }
    },
  )
})

const enrollEvent = {
  'click [data-action=enroll]': () => {
    const doc = Template.currentData().data
    // this is the only place where I use a session variable.
    // can't find a better way.
    // eslint-disable-next-line meteor/no-session
    const enrollments = Session.get('enrollments')
    // cleanup the enrollment list and close the modal
    AutoFormComponents.modalHide()
    // eslint-disable-next-line meteor/no-session
    Session.set('enrollments', [])
    enrollments.forEach(enrollment => enrollEventCall(doc, enrollment))
  },
}

Template.shiftEnrollUsersTable.onRendered(() => {
  Pages.ShiftEnrollUserSearchPages.requestPage(1)
})
Template.projectEnrollUsersTable.onRendered(() => {
  Pages.ProjectEnrollUserSearchPages.requestPage(1)
})
Template.leadEnrollUsersTable.onRendered(() => {
  Pages.LeadEnrollUserSearchPages.requestPage(1)
})

Template.shiftEnrollUsersTable.events(enrollEvent)
Template.projectEnrollUsersTable.events(enrollEvent)
Template.leadEnrollUsersTable.events(enrollEvent)

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
    Meteor.call('email.sendEnrollmentNotifications', user._id, (err, res) => {
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
