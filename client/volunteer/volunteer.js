import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'
import { MeteorProfile } from '../../both/users'
import { AutoForm } from 'meteor/aldeed:autoform'

Template.userDashboard.onCreated(function onCreated() {
  const template = this
  userId = Meteor.userId()
  template.subscribe('meteor-user-profiles.ProfilePictures',userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byUser`,userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byUser`,userId)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`,userId)
})

Template.userDashboard.helpers({
  'userId': () => { return Meteor.userId() },
  'leads': () => {
    sl = Volunteers.Collections.LeadSignups.find({userId: Meteor.userId()}).fetch()
    l = sl.reduce(function (acc,s) {
        t = Volunteers.Collections.Team.findOne(s.parentId)
        if (t) { acc.push(t) }
        return acc
      },[])
    return l
  },
  'metaleads': () => {
    sl = Volunteers.Collections.LeadSignups.find({userId: Meteor.userId()}).fetch()
    l = sl.reduce(function (acc,s) {
        t = Volunteers.Collections.Department.findOne(s.parentId)
        if (t) { acc.push(t) }
        return acc
      },[])
    return l
  },
  'isManager': () => { return Volunteers.isManager() },
  'isNoInfo': () => {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    return (noInfo != null) && Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id])
  }
});

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
  onSuccess: function (formType, result) {
    Router.go('/dashboard')
  }
})
