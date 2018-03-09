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
  bookedMissions: () =>
    (
      (Volunteers.Collections.ShiftSignups.find({ status: 'confirmed' }).count() > 0) ||
      (Volunteers.Collections.ProjectSignups.find({ status: 'confirmed' }).count() > 0) ||
      (Volunteers.Collections.TaskSignups.find({ status: 'confirmed' }).count() > 0)
    ),
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
  teamSelection: () => {
    const limit = Template.instance().teamLimit
    const l = []
    let sel = {}
    // team selection based on the user preferences
    const form = Volunteers.Collections.VolunteerForm.findOne({ userId: Meteor.userId() })
    if ((form.quirks) && (form.quirks.length > 0)) {
      l.push({ quirks: { $in: form.quirks } })
    }
    if ((form.skills) && (form.skills.length > 0)) {
      l.push({ skills: { $in: form.skills } })
    }
    if (l.length > 0) { sel = { $or: l } }
    const userPreferences = Volunteers.Collections.Team.find(sel, { limit }).fetch()
    if (userPreferences.length < limit) {
      const others = Volunteers.Collections.Team.find(
        { $nor: l },
        { limit: (limit - userPreferences.length) },
      ).fetch()
      return userPreferences.concat(others)
    }
    return userPreferences
  },
  searchQuerySpecials: type => (new ReactiveVar({ limit: 4, duties: [type] })),
  searchQueryMenus: teamId => (new ReactiveVar({ limit: 3, teams: [teamId], duties: ['shift'] })),
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
