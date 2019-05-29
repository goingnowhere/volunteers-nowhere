import { Meteor } from 'meteor/meteor'
import React from 'react'
import Fa from 'react-fontawesome'
import { saveAs } from 'file-saver'
import { parse } from 'json2csv'

import { T } from '../common/i18n'

const callForCsv = (method, filename, args) => () => Meteor.call(method, args, (err, data) => {
  if (err) {
    console.error(err)
  } else {
    const csv = parse(data, { withBOM: true })
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename)
  }
})

export const CsvExportButton = ({
  method = 'team.rota',
  buttonText,
  filename,
  ...args
}) => (
  <button type="button" className="btn btn-light btn-sm" onClick={callForCsv(method, filename, args)}>
    <Fa name="file" /> <T>{buttonText}</T>
  </button>
)
