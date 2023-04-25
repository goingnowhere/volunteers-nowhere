import React, { useCallback, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { SignupsList } from 'meteor/goingnowhere:volunteers'
import { MultiSelect } from 'react-multi-select-component'
import { t } from '../common/i18n'
import { Volunteers } from '../../../both/init'

export function FilteredSignupList({ initialShiftType }) {
  const [dutyType, setDutyType] = useState(initialShiftType || 'event')
  const [filters, setFilters] = useState({})
  const {
    quirks,
    skills,
    userQuirks,
    userSkills,
    ready,
  } = useTracker(() => {
    const volFormSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, Meteor.userId())
    const teamSub = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, {})
    const volForm = Volunteers.collections.volunteerForm
      .findOne({ userId: Meteor.userId() }) || {}
    return {
      ready: teamSub.ready() && volFormSub.ready(),
      skills: Volunteers.collections.utils.getSkillsList(),
      quirks: Volunteers.collections.utils.getQuirksList(),
      userQuirks: volForm.quirks,
      userSkills: volForm.skills,
    }
  }, [Volunteers])
  const changeFilter = useCallback((filter) => selected => {
    setFilters({
      ...filters,
      [filter]: selected.length > 0 ? selected.map(({ value }) => value) : undefined,
    })
  }, [filters])

  return ready && (
    <>
      <div className="row no-gutters">
        <select
          id='typeSelect'
          className='col-md-6 col-lg-3'
          value={dutyType}
          onChange={(event) => {
            setDutyType(event.currentTarget.value)
          }}
        >
          <option value="event">{t('event_shifts')}</option>
          <option value="build-strike">{t('build_strike')}</option>
          <option value="lead">{t('lead_positions')}</option>
        </select>
        <MultiSelect
          options={skills}
          value={(filters.skills || []).map(value => ({ value, label: value }))}
          onChange={changeFilter('skills')}
          hasSelectAll={false}
          disableSearch
          overrideStrings={{
            allItemsAreSelected: t('skills'),
            selectSomeItems: t('skills'),
          }}
          className="col-md-6 col-lg-3"
        />
        <MultiSelect
          options={quirks}
          value={(filters.quirks || []).map(value => ({ value, label: value }))}
          onChange={changeFilter('quirks')}
          hasSelectAll={false}
          disableSearch
          overrideStrings={{
            allItemsAreSelected: t('quirks'),
            selectSomeItems: t('quirks'),
          }}
          className="col-md-6 col-lg-3"
        />
        <MultiSelect
          options={['essential', 'important', 'normal'].map(value => ({ value, label: value }))}
          value={(filters.priorities || []).map(value => ({ value, label: value }))}
          onChange={changeFilter('priorities')}
          hasSelectAll={false}
          disableSearch
          overrideStrings={{
            allItemsAreSelected: t('priorities'),
            selectSomeItems: t('priorities'),
          }}
          className="col-md-6 col-lg-3"
        />
      </div>
      <SignupsList dutyType={dutyType} filters={filters} skills={userSkills} quirks={userQuirks} />
    </>
  )
}
