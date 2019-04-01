import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'

Template.publicTeamView.onCreated(function onCreated() {
  const template = this
  const { _teamId } = template.data
  template.team = new ReactiveVar({})
  const subs = [
    template.subscribe(`${Volunteers.eventName}.Volunteers.team`, { _id: _teamId }),
    // Period currently isn't used
    // template.subscribe('eventSettings').ready(),
  ]
  template.subscribe(`${Volunteers.eventName}.ShiftSignups.byTeam`, _teamId)
  template.subscribe(`${Volunteers.eventName}.ProjectSignups.byTeam`, _teamId)
  template.subscribe(`${Volunteers.eventName}.LeadSignups.byTeam`, _teamId)
  template.autorun(() => {
    if (subs.every(sub => sub.ready())) {
      // const settings = EventSettings.findOne()
      const team = Volunteers.Collections.Team.findOne(_teamId)
      // switch (_period) {
      //   case 'event':
      //     team = _.extend(team, { period: settings.eventPeriod })
      //     break
      //   case 'build':
      //     team = _.extend(team, { period: settings.buildPeriod })
      //     break
      //   case 'strike':
      //     team = _.extend(team, { period: settings.strikePeriod })
      //     break
      //   default:
      // }
      template.team.set(team)
    }
  })
})

Template.publicTeamView.helpers({
  team: () => Template.instance().team.get(),
})
