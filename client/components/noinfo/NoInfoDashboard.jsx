import { Meteor } from 'meteor/meteor'
import React, { useState, useEffect } from 'react'
import moment from 'moment-timezone'
import { DutiesListItem, ShiftDateInline, SignupButtons } from 'meteor/goingnowhere:volunteers'
import { T } from '../common/i18n'


export const NoInfoDashboard = () => {
  const [shiftsToday, setTodayShifts] = useState([])
  useEffect(() => {
    Meteor.call('shifts.empty', moment().toDate(), (err, res) => {
      if (err) console.error(err)
      console.log({res})
      setTodayShifts(res || [])
    })
  }, [])
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-md-2 bg-grey">
          <h3>NoInfo</h3>
          <h5 className="mb-2 dark-text"><T>needs_of_the_day</T>:</h5>
          XX/XX
          <h5 className="mb-2 dark-text"><T>needs_of_the_week</T>:</h5>
          XX/XX
          <h5 className="mb-2 dark-text"><T>urgent_shifts</T>:</h5>
          XX/XX
        </div>
        <div className="col">
          <h2 className="header"> <T>urgent_shifts_today</T> </h2>
          {shiftsToday.map(shift => (
            <div className="px-2 pb-0 signupsListItem">
              <DutiesListItem duty={shift} />
              <span>
                <ShiftDateInline {...shift} />
                <SignupButtons {...shift} />
              </span>
            </div>
          ))}
          filters : team / urgent / time of day
          {/* <!-- {{> weekstrip day=currentDay callback=updateCurrentDay }} -->
          <!-- todo - searchQuery=searchQuery present day }} --> */}
        </div>
        <div className="col">
          <h2 className="header"> <T>urgent_shifts_week</T> </h2>
          filters : day / team / urgent / time of day
          {/* <!-- todo - display only the shifts/tasks with empty spots --> */}
        </div>

      </div>
    </div>
  )
}
