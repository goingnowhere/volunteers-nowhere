import { Meteor } from 'meteor/meteor'
import React, { useCallback } from 'react'
import { parse } from 'json2csv'

import { ExportButton } from './ExportButton.jsx'

const parseToCsv = js => parse(js, { withBOM: true })

export const CsvExportButton = ({
  method = 'team.rota',
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
      parse={parseToCsv}
      extension="csv"
      generate={generate}
    />
  )
}
