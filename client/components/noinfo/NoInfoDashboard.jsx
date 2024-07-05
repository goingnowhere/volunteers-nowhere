import React, {
  useEffect,
  useState,
} from 'react'
import moment from 'moment-timezone'
import { Link } from 'react-router-dom'
import {
  DutiesListItem,
  Loading,
  ShiftDate,
  SignupProjectRow,
  SignupShiftButtons,
  useMethodCallData,
} from 'meteor/goingnowhere:volunteers'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { T } from '../common/i18n'
import { Volunteers } from '../../../both/init'
import { fetchSettings } from '../../../both/methods'

export const NoInfoDashboard = ({ period }) => {
  const { methods } = Volunteers
  const [settings, settingsLoaded] = useMethodCallData(fetchSettings)
  const [datesFilter, setDatesFilter] = useState({})
  useEffect(() => {
    if (settingsLoaded && period === 'event') {
      const start = settings.eventPeriod.start.valueOf() < Date.now() ? new Date() : settings.eventPeriod.start
      const end = moment(settings.eventPeriod.end).add(1, 'day').toDate()
      setDatesFilter({ start, end })
    }
    if (settingsLoaded && period === 'strike') {
      const start = settings.strikePeriod.start
      const end = moment(settings.strikePeriod.end).add(1, 'day').toDate()
      setDatesFilter({ start, end })
    }
  }, [period, settingsLoaded])
  const [duties, isLoaded] = useMethodCallData(methods.listOpenShifts, {
    dates: datesFilter,
  }, { holdCall: !datesFilter.start, default: [] })

  const voluntell = (shift) => {
    if (shift.type === 'rota') {
      AutoFormComponents.ModalShowWithTemplate('shiftEnrollUsersTable', {
        data: {
          teamId: shift.parentId,
          shiftId: shift._id,
          duty: 'shift',
          policy: shift.policy,
        },
      })
    } else if (shift.type === 'project') {
      AutoFormComponents.ModalShowWithTemplate('projectEnrollUsersTable', {
        data: {
          teamId: shift.parentId,
          shiftId: shift._id,
          duty: 'project',
          policy: shift.policy,
          start: shift.start,
          end: shift.end,
        },
      })
    }
  }
  // <h5 className="mb-2 dark-text"><T>needs_of_the_day</T>:</h5>
  // XX/XX
  // <h5 className="mb-2 dark-text"><T>needs_of_the_week</T>:</h5>
  // XX/XX
  // <h5 className="mb-2 dark-text"><T>urgent_shifts</T>:</h5>
  // XX/XX
  // filters : team / urgent / time of day
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-md-2 bg-grey dashboard-side-panel">
          <h3>NoInfo</h3>
          {period === 'event' && (
            <>
              <h2 className="header"> <T>urgent_shifts_week</T> </h2>
              <Link to="/noinfo/strike" className="btn btn-light btn-sm">
                Strike shifts!
              </Link>
            </>
          )}
          {period === 'strike' && (
            <>
              <h2 className="header"> Urgent Strike Shifts </h2>
              <Link to="/noinfo" className="btn btn-light btn-sm">
                Event shifts!
              </Link>
            </>
          )}
        </div>
        <div className="col">
          {!isLoaded && <Loading />}
          {isLoaded && duties.map((duty) => duty.score !== 0 && (
            <div key={duty._id} className="px-2 pb-2 signupsListItem">
              <DutiesListItem duty={duty} />
              {duty.type === 'rota' &&
                duty.shiftObjects.map((shift) => shift.maxNotPending !== 0 && (
                  <div key={shift._id} className="list-item row align-items-center px-2">
                    <ShiftDate start={shift.start} end={shift.end} />
                    <div className="col">
                      <SignupShiftButtons key={shift._id} {...shift} onClickSignup={voluntell} />
                    </div>
                  </div>
              ))}
              {duty.type === 'project' && (
                  <div className="list-item row align-items-center pl-2 pr-4">
                  <SignupProjectRow duty={duty} showSignupModal={voluntell} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
