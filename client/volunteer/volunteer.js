import { Router } from 'meteor/iron:router'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Volunteers } from '../../both/init'

Template.userDashboard.onCreated(function onCreated() {
  const template = this
  const userId = Meteor.userId()
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byUser`, userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byUser`, userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.ProjectSignups.byUser`, userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`, userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.Team`)
})

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
})

Template.signupsListTabs.helpers({
  userPref: () => {
    const form = Volunteers.Collections.VolunteerForm.findOne({ userId: Meteor.userId() })
    return { quirks: form.quirks, skills: form.skills }
  },
})

Template.signupsListTabs.events({
  'change #tabSelect': (event, template) => {
    template.$('.tab-pane').hide();
    template.$('.tab-pane').eq($(event.target).val()).show();
  }
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
