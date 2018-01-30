// import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Router } from 'meteor/iron:router'
import { Template } from 'meteor/templating'
import { AutoForm } from 'meteor/aldeed:autoform'
// import { MeteorProfile } from '../../both/users'
import { Volunteers } from '../../both/init'

Template.userDashboard.onCreated(function onCreated() {
  const template = this
  const userId = Meteor.userId()
  template.subscribe('meteor-user-profiles.ProfilePictures', userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byUser`, userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byUser`, userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`, userId)
})

Template.userDashboard.helpers({
  userId: () => Meteor.userId(),
  leads: () => {
    const sl = Volunteers.Collections.LeadSignups.find({ userId: Meteor.userId() }).fetch()
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
})

Template.userDashboard.events({
  'click [data-action="settings"]': (event, templateInstance) => {
    Router.go('volunteerForm')
  },
})

AutoForm.addHooks([
  'InsertUsersFormId',
  'UpdateUsersFormId',
  'InsertVolunteerFormFormId',
  'UpdateVolunteerFormFormId'], {
  onSuccess(formType, result) {
    Router.go('/dashboard')
  },
})
