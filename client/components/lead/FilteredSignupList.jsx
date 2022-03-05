import React, { useCallback, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { SignupsList } from 'meteor/goingnowhere:volunteers'
import { MultiSelect } from 'react-multi-select-component'
import { t } from '../common/i18n'
import { Volunteers } from '../../../both/init'

export function FilteredSignupList() {
  const [dutyType, setDutyType] = useState('event')
  const [filters, setFilters] = useState({})
  const { quirks, skills, ready } = useTracker(() => {
    const volForm = Volunteers.Collections.volunteerForm
      .findOne({ userId: Meteor.userId() }) || {}
    return {
      ready: Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, {}).ready(),
      skills: Volunteers.getSkillsList(),
      quirks: Volunteers.getQuirksList(),
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
      <div className="signupListFilters row no-gutters">
        <select
          id='typeSelect'
          className='col-md-6 col-lg-3'
          value={dutyType}
          onChange={(event) => {
            setDutyType(event.currentTarget.value)
          }}
        >
          <option value="event">{t('event_shifts')}</option>
          <option value="project">{t('build_strike')}</option>
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
      <SignupsList dutyType={dutyType} filters={filters} skills={skills} quirks={quirks} />
    </>
  )
}
