import { Template } from 'meteor/templating'
import { Volunteers } from '../../both/init'

Template.publicTeamView.onCreated(function onCreated() {
  const template = this
  const did = template.data._id
  template.subscribe(`${Volunteers.eventName}.ShiftSignups.byTeam`, did)
  template.subscribe(`${Volunteers.eventName}.ProjectSignups.byTeam`, did)
  template.subscribe(`${Volunteers.eventName}.LeadSignups.byTeam`, did)
})
