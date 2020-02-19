import React, { useEffect, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { Volunteers } from '../../../both/init'
import { T } from '../common/i18n'

const moveTeam = (event, teamId, deptId, close) => {
  event.preventDefault()
  Meteor.call(`${Volunteers.eventName}.Volunteers.team.update`, {
    _id: teamId,
    modifier: {
      $set: {
        parentId: deptId,
      },
    },
  })
  close()
}


export const MoveTeam = ({ team, close }) => {
  const [depts, setDepts] = useState([])
  useEffect(() => {
    Meteor.call(`${Volunteers.eventName}.Volunteers.depts.find`, (err, res) => {
      if (err) console.error(err)
      setDepts(res)
    })
  }, [])
  const [selected, setSelected] = useState()

  return (
    <form onSubmit={(event) => moveTeam(event, team._id, selected, close)}>
      <div className="form-group" data-required="true">
        <label htmlFor="dept" className="control-label"><T>department</T></label>
        <select name="dept" id="dept" className="form-control" value={selected} onChange={(event) => setSelected(event.target.value)}>
          <option value="">(Select One)</option>
          {depts.map((dept) => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
        {/* <p className="form-text text-muted">Help text</p> */}
      </div>
      <div className="form-group">
        <button type="submit" className="pull-right btn btn-primary">
          <T>move_team</T>
        </button>
      </div>
    </form>
  )
}
