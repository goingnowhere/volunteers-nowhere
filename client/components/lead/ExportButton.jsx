import React from 'react'
import Fa from 'react-fontawesome'
import { saveAs } from 'file-saver'

import { T } from '../common/i18n'

const extensionMap = {
  csv: 'text/csv',
  json: 'application/json',
}

const callMethod = ({
  generate,
  filename,
  extension,
  parse,
}) => () => generate((err, data) => {
  if (err) {
    console.error(err)
  } else {
    const csv = parse(data)
    saveAs(new Blob([csv], { type: `${extensionMap[extension]};charset=utf-8` }), `${filename}.${extension}`)
  }
})

export const ExportButton = ({
  generate,
  buttonText,
  filename,
  extension,
  parse,
}) => (
  <button
    type="button"
    className="btn btn-light btn-sm d-block"
    onClick={callMethod({
      generate,
      filename,
      extension,
      parse,
    })}
  >
    <Fa name="file" /> <T>{buttonText}</T>
  </button>
)
