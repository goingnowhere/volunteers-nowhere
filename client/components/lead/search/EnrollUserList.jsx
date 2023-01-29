import React from 'react'

import { EnrollListEntry } from './EnrollListEntry.jsx'
import { UserSearchList } from './UserSearchList.jsx'
import { getShiftEnrollButton } from './ShiftEnrollButton.jsx'

export const EnrollUserList = ({
  data,
}) => {
  const EnrollButton = getShiftEnrollButton(data)
  return <UserSearchList Component={EnrollListEntry} Controls={EnrollButton} />
}
