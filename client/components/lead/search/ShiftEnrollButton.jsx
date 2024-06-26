import React, { useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { Bert } from 'meteor/themeteorchef:bert'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'

import { Volunteers } from '../../../../both/init'
import { setTimezoneForUpload, dayStringFromTZDate } from '../../../../both/locale'
import { T, t } from '../../common/i18n'

const enroll = (type, {
  duty,
  policy,
  teamId: parentId,
  ...details
}) => {
// TODO This duplicates logic from meteor-volunteers apply code and confirmation should happen in
// the method not in the frontend
  Meteor.call(
    `${Volunteers.eventName}.Volunteers.signups.insert`, {
      ...details,
      type,
      parentId,
      enrolled: true,
    },
    (err, insertResult) => {
      if (err) {
        switch (err.error) {
        case 409: {
          if (err.reason === 'Double Booking') {
            Bert.alert({
              hideDelay: 6500,
              title: t('double_booking'),
              /* XXX: add details of the other bookings stored in err.details */
              /* message: applyContext(templatebody, err),  */
              message: t('double_booking_msg'),
              type: 'warning',
              style: 'growl-top-right',
            })
          } else {
            Bert.alert({
              hideDelay: 6500,
              title: t('shift_full'),
              message: t('shift_full_msg'),
              type: 'warning',
              style: 'growl-top-right',
            })
          }
          break
        }
        default:
          Bert.alert({
            hideDelay: 6500,
            title: t('error'),
            message: err.reason,
            type: 'danger',
            style: 'growl-top-right',
          })
        }
      } else if (insertResult) {
        Bert.alert({
          hideDelay: 6500,
          title: t('success'),
          message: t('voluntell_success'),
          type: 'success',
          style: 'growl-top-right',
        })
      }
    },
  )
}

// TODO wrap with an async methos HOC for loading state
export const ShiftEnrollButton = ({ refreshSearch, ...details }) => (
  <button
    type="button"
    className="btn btn-primary fl"
    onClick={() => {
      enroll(details.duty, details)
      refreshSearch()
    }}
  >
    <T>enroll</T>
  </button>
)

export const ProjectEnrollButton = ({
  refreshSearch,
  start,
  end,
  ...details
}) => {
  const [[startEnroll, endEnroll], setEnrollDates] = useState([])
  return (
    <div>
      <Flatpickr
        className="form-control"
        options={{
          mode: 'range',
          dateFormat: 'Y-m-d',
          altFormat: 'F j, Y',
          minDate: dayStringFromTZDate(start),
          maxDate: dayStringFromTZDate(end),
        }}
        onClose={setEnrollDates}
      />
      <button
        type="button"
        className="btn btn-primary float-right"
        disabled={!startEnroll || !endEnroll}
        onClick={() => {
          enroll('project', {
            start: setTimezoneForUpload(startEnroll),
            end: setTimezoneForUpload(endEnroll),
            ...details,
          })
          refreshSearch()
        }}
      >
        <T>enroll</T>
      </button>
    </div>
  )
}

export const getShiftEnrollButton = ({
  duty,
  ...details
}) => ({ userId, refreshSearch }) => {
  if (duty === 'project') {
    return ProjectEnrollButton({
      duty,
      ...details,
      userId,
      refreshSearch,
    })
  }
  return ShiftEnrollButton({
    duty,
    ...details,
    userId,
    refreshSearch,
  })
}
