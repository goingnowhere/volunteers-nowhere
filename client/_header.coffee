import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import '../imports/freelancer/js/freelancer.js';
import '../imports/freelancer/css/freelancer.css';
import { Volunteers } from '/both/init'

Template._header.onCreated () ->
  template = this
  template.subscribe("#{Volunteers.eventName}.Volunteers.organization")

Template._header.helpers
# XXX : restrict only to those depts and teams leaded by the user, or display all for manager
  'departments': () -> Volunteers.Collections.Department.find()
  'teams': () -> Volunteers.Collections.Team.find()
  'isManagerOrLead': () ->
    teams = Volunteers.Collections.Team.find().map((t) -> t._id)
    Volunteers.isManagerOrLead(Meteor.userId(),teams)
  'isManagerOrMetaLead': () ->
    departments = Volunteers.Collections.Department.find().map((t) -> t._id)
    Volunteers.isManagerOrLead(Meteor.userId(),departments)
  'isManager': () -> Volunteers.isManager()
  'isNoInfo': () ->
    noInfo = Volunteers.Collections.Team.findOne({name: 'NoInfo'})
    if noInfo?
      Volunteers.isManagerOrLead(Meteor.userId(),[noInfo._id])
