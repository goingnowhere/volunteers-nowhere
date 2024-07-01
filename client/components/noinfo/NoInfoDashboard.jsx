import React, {
  useEffect,
  useState,
} from 'react'
import {
  DutiesListItem,
  ShiftDate,
  SignupShiftButtons,
  useMethodCallData,
} from 'meteor/goingnowhere:volunteers'
import { AutoFormComponents } from 'meteor/abate:autoform-components'
import { T } from '../common/i18n'
import { Volunteers } from '../../../both/init'
import { fetchSettings } from '../../../both/methods'

export const NoInfoDashboard = () => {
  const { methods } = Volunteers
  const [settings, settingsLoaded] = useMethodCallData(fetchSettings)
  const [datesFilter, setDatesFilter] = useState({})
  useEffect(() => {
    if (settingsLoaded) {
      setDatesFilter({ start: settings.eventPeriod.start, end: settings.eventPeriod.end })
    }
  }, [settingsLoaded])
  const [duties, isLoaded] = useMethodCallData(methods.listOpenShifts, {
    dates: datesFilter,
  }, { holdCall: !datesFilter.start, default: [] })

  // TODO support projects too
  const voluntell = (shift) => {
    AutoFormComponents.ModalShowWithTemplate('shiftEnrollUsersTable', {
      data: {
        teamId: shift.parentId,
        shiftId: shift._id,
        duty: 'shift',
        policy: shift.policy,
      },
    })
  }
  // <h5 className="mb-2 dark-text"><T>needs_of_the_day</T>:</h5>
  // XX/XX
  // <h5 className="mb-2 dark-text"><T>needs_of_the_week</T>:</h5>
  // XX/XX
  // <h5 className="mb-2 dark-text"><T>urgent_shifts</T>:</h5>
  // XX/XX
  // <div className="col">
  //   <h2 className="header"> <T>urgent_shifts_today</T> </h2>
  // </div>
  // filters : team / urgent / time of day
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-md-2 bg-grey dashboard-side-panel">
          <h3>NoInfo</h3>
        </div>
        <div className="col">
          <h2 className="header"> <T>urgent_shifts_week</T> </h2>
          {isLoaded && duties.map((duty) => (
            <div key={duty._id} className="px-2 pb-0 signupsListItem">
              <DutiesListItem duty={duty} />
              {duty.shiftObjects.map((shift) => shift.maxNotPending !== 0 && (
                <div key={shift._id} className="list-item row align-items-center px-2">
                  <ShiftDate start={shift.start} end={shift.end} />
                  <div className="col">
                    <SignupShiftButtons key={shift._id} {...shift} onClickSignup={voluntell} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
