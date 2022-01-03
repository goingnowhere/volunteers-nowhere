import React, { useCallback, useState } from 'react'
import Fa from 'react-fontawesome'
import { Meteor } from 'meteor/meteor'

import { T } from '../common/i18n'

export const RotaImport = () => {
  const [rotaJson, setJson] = useState('')
  const [error, setError] = useState()
  const uploadJson = useCallback(e => {
    e.preventDefault()
    Meteor.call('rota.all.import', { rotaJson }, (res) => {
      console.log({ res })
      if (res?.error === 400) {
        setError('invalid_json')
      } else if (res?.error) {
        setError('unknown_error')
      } else {
        setError()
        setJson('')
      }
    })
  }, [rotaJson])
  return (
    <form>
      <input
        type="text"
        name="rotaJson"
        value={rotaJson}
        onChange={e => setJson(e.target.value)}
        placeholder="Paste JSON to import here"
      />
      {error && (
        <small className="warning"><T>{error}</T></small>
      )}
      <button
        type="submit"
        className="btn btn-light btn-sm d-block"
        onClick={uploadJson}
      >
        <Fa name="file" /> <T>upload</T>
      </button>
    </form>
  )
}
