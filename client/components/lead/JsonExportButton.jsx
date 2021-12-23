import { Meteor } from 'meteor/meteor'
import React, { useCallback } from 'react'

import { ExportButton } from './ExportButton.jsx'

const parse = js => JSON.stringify(js, undefined, 2)

export const JsonExportButton = ({
  method,
  buttonText,
  filename,
  methodArgs,
}) => {
  const generate = useCallback(callback =>
    Meteor.call(method, methodArgs, callback), [method, methodArgs])
  return (
    <ExportButton
      method={method}
      buttonText={buttonText}
      filename={filename}
      parse={parse}
      extension="json"
      generate={generate}
    />
  )
}
