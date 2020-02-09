import React, { useState, useMemo } from 'react'
import moment from 'moment-timezone'

const generateWeek = (year, week) => {
  if (!year || !week) return []
  const start = moment()
    .year(year)
    .week(week)
    .weekday(0)
    .startOf('day')
  return [...Array(7).keys()].map((i) => start.clone().add(i, 'days'))
}

// Display a horizontal strip containing the days of the week
//   Props: - day: Date() object - the currently selected day
//         - shownDay: Date() object - a day in the week to show first
//         - callback: function (date) -> {} executed when on day is selected
export const WeekStrip = ({
  year,
  initialWeek,
  currentDay,
  setDay,
}) => {
  const [week, setWeekNumber] = useState(initialWeek)
  const weekDays = useMemo(() => generateWeek(year, week || initialWeek), [year, week, initialWeek])
  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className="page-item">
          <button
            type="button"
            className="page-link h-100"
            title="Previous week"
            onClick={() => setWeekNumber((week || initialWeek) - 1)}
          >
            <span aria-hidden="true">&laquo;</span>
            <span className="sr-only">Previous</span>
          </button>
        </li>
        {weekDays.map((day) => {
          const isCurrentDay = day.isSame(currentDay, 'day')
          return (
            <li key={day.dayOfYear()} className={`page-item${isCurrentDay ? ' active' : ''}`}>
              <button
                type="button"
                className="page-link h-100"
                title=""
                onClick={() => setDay(isCurrentDay ? null : day)}
              >
                {day.format('ddd Do')} <small>{day.format('MMM')}</small>
              </button>
            </li>
          )
        })}
        <li className="page-item">
          <button
            type="button"
            className="page-link h-100"
            title="Next week"
            onClick={() => setWeekNumber((week || initialWeek) + 1)}
          >
            <span aria-hidden="true">&raquo;</span>
            <span className="sr-only">Next</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
