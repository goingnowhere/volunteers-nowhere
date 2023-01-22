import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import React from 'react'
import { SignupsListTeam } from 'meteor/goingnowhere:volunteers'

import { Volunteers } from '../../../both/init'
import { T } from '../common/i18n'

// TODO Make this more useful e.g. at least adding personal signups
export const PublicTeamView = ({ match: { params: { teamId } } }) => {
  const { team, ready } = useTracker(() => {
    const teamSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, { _id: teamId })
    const subs = [
      teamSub,
      // Meteor.subscribe(`${Volunteers.eventName}.Signups.byTeam`, teamId, 'shift'),
      // Meteor.subscribe(`${Volunteers.eventName}.Signups.byTeam`, teamId, 'project'),
      // Meteor.subscribe(`${Volunteers.eventName}.Signups.byTeam`, teamId, 'lead'),
    ]

    let foundTeam = {}
    if (teamSub.ready()) {
      foundTeam = Volunteers.collections.team.findOne(teamId)
      // const settings = EventSettings.findOne()
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
    }

    return { team: foundTeam, ready: subs.every(sub => sub.ready()) }
  }, [teamId])

  return (
    <div className="container">
      <div className="row">
        {team && (
          <div className="card">
            <div className="card-header">
              <h5>{team.name}</h5>
              {team.email && (
                <h5 className="text-muted text-right"><T>contact</T>: {team.email}</h5>
              )}
            </div>
            <p className="m-2">{team.description}</p>
          </div>
        )}
      </div>
      <h3 className="pt-2"><T>shifts_in_this_team</T></h3>
      {ready && (
        <SignupsListTeam team={team} />
      )}
    </div>
  )
}
