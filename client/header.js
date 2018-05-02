/* eslint-disable meteor/template-names, no-underscore-dangle */
import { Template } from 'meteor/templating'
import { Roles } from 'meteor/piemonkey:roles'
import { Volunteers } from '../both/init'

Template.header.onCreated(function onCreated() {
  const template = this
  const userId = Meteor.userId()
  template.unitsSel = new ReactiveVar()
  template.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
  template.subscribe(`${Volunteers.eventName}.Volunteers.LeadSignups.byUser`, userId)

  template.autorun(() => {
    const unitsIds = Roles.getRolesForUser(userId, Volunteers.eventName)
    if (Volunteers.isManager()) {
      template.unitsSel.set({})
    } else if (unitsIds.length > 0) {
      template.unitsSel.set({ _id: { $in: unitsIds } })
    }
  })
})

Template.header.helpers({
  allDepartments: () => Volunteers.Collections.Department.find(),
  departments: () => Volunteers.Collections.Department.find(Template.instance().unitsSel.get()),
  teams: () => Volunteers.Collections.Team.find(Template.instance().unitsSel.get()),
  // the TOS is true only if the form was submitted
  hasAgreedTOS() {
    const user = Meteor.user()
    const f = Volunteers.Collections.VolunteerForm.findOne({ userId: user._id })
    const t = user.profile.terms
    return (t && f)
  },
  isManagerOrLead: () => {
    const teams = Volunteers.Collections.Team.find().map(t => t._id)
    return Volunteers.isManagerOrLead(Meteor.userId(), teams)
  },
  isManagerOrMetaLead: () => {
    const departments = Volunteers.Collections.Department.find().map(t => t._id)
    return Volunteers.isManagerOrLead(Meteor.userId(), departments)
  },
  isManager: () => Volunteers.isManager(),
  isNoInfo: () => {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    return (noInfo != null) && Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id])
  },
})
