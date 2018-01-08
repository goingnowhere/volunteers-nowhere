import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { Volunteers } from '../../both/init'

Template.userDashboard.onCreated(function onCreated() {
  const template = this
  userId = Meteor.userId()
  Meteor.subscribe(`${Volunteers.eventName}.Volunteers.ShiftSignups.byUser`,userId)
  Meteor.subscribe(`${Volunteers.eventName}.Volunteers.TaskSignups.byUser`,userId)
  Meteor.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`,userId)
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
    AutoFormComponents.ModalShowWithTemplate('addVolunteerForm')
  },
})
