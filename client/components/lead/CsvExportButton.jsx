import { Meteor } from 'meteor/meteor'
import React from 'react'
import Fa from 'react-fontawesome'
import { saveAs } from 'file-saver'
import { parse } from 'json2csv'

import { T } from '../common/i18n'

const rotaCsv = (teamId, unitType) => () => Meteor.call(`${unitType}.rota`, teamId, (err, shifts) => {
  if (err) {
    console.error(err)
  } else {
    const csv = parse(shifts, { withBOM: true })
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'rota.csv')
  }
})

export const CsvExportButton = ({ teamId, unitType = 'team' }) => (
  <button type="button" className="btn btn-light btn-sm" onClick={rotaCsv(teamId, unitType)}>
    <Fa name="file" /> <T>rota_export</T>
  </button>
)
