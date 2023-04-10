import React, { useEffect, useState } from 'react'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { AutoForm } from 'meteor/aldeed:autoform'
import { useHistory } from 'react-router-dom'

import { fetchSettings } from '../../../both/methods'
import { EventSettings } from '../../../both/collections/settings'

const FORM_ID = 'EventSettingsEdit'

export const EventSettingsScreen = ({ settings, isLoaded }) => {
  const history = useHistory()
  useEffect(() => {
    AutoForm.addHooks(
      FORM_ID,
      {
        onSuccess: function onSuccess() {
          history.push('/manager')
        },
      },
      true,
    )
  }, [history])

  return (
    <div className="container">
      {isLoaded && settings && (
        <Blaze
          template="quickForm"
          collection={EventSettings}
          id={FORM_ID}
          doc={settings}
          type="method-update"
          meteormethod="settings.update"
          omitFields="eventName"
        />
      )}
    </div>
  )
}
