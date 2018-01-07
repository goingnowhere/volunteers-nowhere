/* eslint-disable meteor/template-names, no-underscore-dangle */

import { Template } from 'meteor/templating'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'
import '../imports/freelancer/js/freelancer'
import '../imports/freelancer/css/freelancer.css'
import { Volunteers } from '../both/init'

Template._header.onCreated(function onCreated() {
  const template = this
  return template.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
})

Template._header.helpers({
// XXX : restrict only to those depts and teams leaded by the user, or display all for manager
  departments() { return Volunteers.Collections.Department.find() },
  teams() { return Volunteers.Collections.Team.find() },
  isManagerOrLead() {
    const teams = Volunteers.Collections.Team.find().map(t => t._id)
    return Volunteers.isManagerOrLead(Meteor.userId(), teams)
  },
  isManagerOrMetaLead() {
    const departments = Volunteers.Collections.Department.find().map(t => t._id)
    return Volunteers.isManagerOrLead(Meteor.userId(), departments)
  },
  isManager() { return Volunteers.isManager() },
  isNoInfo() {
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    return (noInfo != null) && Volunteers.isManagerOrLead(Meteor.userId(), [noInfo._id])
  },
})
