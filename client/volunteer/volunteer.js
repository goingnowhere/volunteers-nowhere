import $ from 'jquery'
import 'bootstrap'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.css'
import { Router } from 'meteor/iron:router'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Volunteers } from '../../both/init'

Template.userDashboard.helpers({
  userId: () => Meteor.userId(),
  leads: () => {
    const sl = Volunteers.Collections.LeadSignups.find({ userId: Meteor.userId(), status: 'confirmed' }).fetch()
    const l = sl.reduce((acc, s) => {
      const t = Volunteers.Collections.Team.findOne(s.parentId)
      if (t) { acc.push(t) }
      return acc
    }, [])
    return l
  },
  metaleads: () => {
    const sl = Volunteers.Collections.LeadSignups.find({ userId: Meteor.userId() }).fetch()
    const l = sl.reduce((acc, s) => {
      const t = Volunteers.Collections.Department.findOne(s.parentId)
      if (t) { acc.push(t) }
      return acc
    }, [])
    return l
  },
  isManager: () => Volunteers.isManager(),
  isNoInfo: () => {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    return (noInfo != null) && Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id])
  },
  bookedMissions: () => {
    const sel = { status: { $in: ['confirmed', 'pending'] } }
    return (
      (Volunteers.Collections.ShiftSignups.find(sel).count() > 0) ||
      (Volunteers.Collections.ProjectSignups.find(sel).count() > 0) ||
      (Volunteers.Collections.LeadSignups.find(sel).count() > 0) ||
      (Volunteers.Collections.TaskSignups.find(sel).count() > 0)
    )
  },
})

Template.userDashboard.events({
  'click [data-action="edit_form"]': () => {
    Router.go('volunteerForm')
  },
})

Template.signupsListTabs.onCreated(function onCreated() {
  const template = this
  template.teamLimit = 4
  template.subscribe(`${Volunteers.eventName}.Volunteers.Team`)
  template.filters = {
    skills: new ReactiveVar(),
    quirks: new ReactiveVar(),
  }
})
Template.signupsListTabs.onRendered(function onRendered() {
  const template = this
  // Need to add this event listener this way as adding through Blaze doesn't work - Rich
  template.$('#skillSelect').on('changed.bs.select', (event) => {
    // Seriously? There must be a better way. Docs claim we get an arg but we don't - Rich
    const val = Array.from(event.target.selectedOptions).map(option => option.value)
    template.filters.skills.set(val.length > 0 ? val : null)
  })
  // Possibly only needed in development when reloading
  template.$('#skillSelect').selectpicker('refresh')

  template.$('#quirkSelect').on('changed.bs.select', (event) => {
    // Seriously? There must be a better way. Docs claim we get an arg but we don't - Rich
    const val = Array.from(event.target.selectedOptions).map(option => option.value)
    template.filters.quirks.set(val.length > 0 ? val : null)
  })
  // Possibly only needed in development when reloading
  template.$('#quirkSelect').selectpicker('refresh')

  template.$('#tabSelect').on('changed.bs.select', (event) => {
    template.$('.tab-pane').hide()
    template.$('.tab-pane').eq($(event.target).val()).show()
  })
  template.$('#tabSelect').selectpicker('refresh')
})

Template.signupsListTabs.helpers({
  userPref: () => {
    const form = Volunteers.Collections.VolunteerForm.findOne({ userId: Meteor.userId() })
    return { quirks: form.quirks, skills: form.skills }
  },
  // Not sure why we're deliberately including null values in these lists - Rich
  skills: () => Volunteers.getSkillsList().filter(skill => skill.value),
  quirks: () => Volunteers.getQuirksList().filter(quirk => quirk.value),
  filters: () => ({
    skills: Template.instance().filters.skills.get(),
    quirks: Template.instance().filters.quirks.get(),
  }),
})

AutoForm.addHooks([
  'InsertUsersFormId',
  'UpdateUsersFormId',
  'InsertVolunteerFormFormId',
  'UpdateVolunteerFormFormId'], {
  onSuccess() {
    Router.go('/dashboard')
  },
})
