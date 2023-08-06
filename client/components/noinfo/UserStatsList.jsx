import React from 'react'
import { Loading, useMethodCallData } from 'meteor/goingnowhere:volunteers'

import { T } from '../common/i18n'

export function UserStatsList() {
  const [userStats, isLoaded] = useMethodCallData('users.stats')

  return !isLoaded ? <Loading /> : (
    <>
      <div><span className="mb-2 dark-text"><T>all_users</T>:</span> {userStats.registered}</div>
      <div><span className="mb-2 dark-text"><T>profile_filled</T>:</span> {userStats.bioFilled}</div>
      <div><span className="mb-2 dark-text"><T>with_picture</T>:</span> {userStats.withPicture}</div>
      <div><span className="mb-2 dark-text"><T>ticket_holders</T>:</span> {userStats.withTicket}</div>
      <div><span className="mb-2 dark-text"><T>with_duties</T>:</span> {userStats.withDuties}</div>
      <div><span className="mb-2 dark-text"><T>leads</T>:</span> {userStats.leads}</div>
      <div><span className="mb-2 dark-text"><T>with_event_time_roles</T>:</span> {userStats.eventTimeAny}</div>
      <div><span className="mb-2 dark-text"><T>with_three_event_time_roles</T>:</span> {userStats.eventTimeThree}</div>
      <div><span className="mb-2 dark-text"><T>online</T>:</span> {userStats.online}</div>
    </>
  )
}
