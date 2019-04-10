import { Meteor } from 'meteor/meteor'
import React from 'react'
import Fa from 'react-fontawesome'
import { saveAs } from 'file-saver'
import { parse } from 'json2csv'

import { T } from '../common/i18n'

const rotaCsv = teamId => () => Meteor.call('team.rota', teamId, (err, shifts) => {
  if (err) {
    console.error(err)
  } else {
    const csv = parse(shifts)
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'rota.csv')
  }
})

export const CsvExportButton = ({ teamId }) => (
  <button type="button" className="btn btn-light btn-sm" onClick={rotaCsv(teamId)}>
    <Fa name="file" /> <T>rota_export</T>
  </button>
)
