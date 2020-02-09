import { Meteor } from 'meteor/meteor'
import React, { Fragment, useState, useEffect } from 'react'
import moment from 'moment-timezone'
import { TeamShiftsTable, TeamProjectsTable } from 'meteor/goingnowhere:volunteers'
import { T } from '../common/i18n'
import { WeekStrip } from '../common/WeekStrip.jsx'
import { NoInfoUserProfile } from '../noinfo/NoInfoUserProfile.jsx'

export const TabbedDutySummary = ({ teamId }) => {
  const [tab, setTab] = useState('shift')
  const [stuff, setInitialWeek] = useState([])
  const [initialWeek, year] = stuff
  // TODO Move up somehow, either by passing in or finally adding redux
  useEffect(() => Meteor.call('eventSettings', (err, settings) => {
    if (err) console.error(err)
    else {
      const eventStart = moment(settings.eventPeriod.start)
      setInitialWeek([eventStart.week(), eventStart.year()])
    }
  }), [])
  const [currentDay, setCurrentDay] = useState()
  return (
    <Fragment>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button type="button" className={`nav-link${tab === 'shift' ? ' active' : ''}`} onClick={() => setTab('shift')}>
            <span><T>all_shifts</T></span>
          </button>
        </li>
        <li className="nav-item">
          <button type="button" className={`nav-link${tab === 'project' ? ' active' : ''}`} onClick={() => setTab('project')}>
            <span><T>all_projects</T></span>
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {tab === 'shift' && initialWeek && (
          <div role="tabpanel" className={`tab-pane${tab === 'shift' ? ' active' : ''}`}>
            <div className="pt-2">
              <WeekStrip
                currentDay={currentDay}
                initialWeek={initialWeek}
                year={year}
                setDay={setCurrentDay}
              />
              <TeamShiftsTable
                teamId={teamId}
                date={currentDay}
                UserInfoComponent={NoInfoUserProfile}
              />
            </div>
          </div>
        )}
        {tab === 'project' && (
          <div role="tabpanel" className={`tab-pane${tab === 'project' ? ' active' : ''}`}>
            <TeamProjectsTable teamId={teamId} UserInfoComponent={NoInfoUserProfile} />
          </div>
        )}
      </div>
    </Fragment>
  )
}
