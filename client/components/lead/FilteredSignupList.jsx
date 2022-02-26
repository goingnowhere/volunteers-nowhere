import React, { useCallback, useState } from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { SignupsList } from 'meteor/goingnowhere:volunteers'
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
  // TODO Add a React multi-select lib to fix this mess
  // Workaround bootstrap not allowing click to deselect last option or select multiple
  const selectHack = useCallback((filter, value) => {
    const filtersToChange = filters[filter] || []
    const filteredFilters = filtersToChange.filter(filt => filt !== value)
    const newFilters = filteredFilters.length === filtersToChange.length
      ? [...filtersToChange, value] : filteredFilters
    setFilters({
      ...filters,
      [filter]: newFilters.length > 0 ? newFilters : undefined,
    })
  }, [filters])
  return ready && (
    <>
      <select
        id='typeSelect'
        value={dutyType}
        onChange={(event) => {
          setDutyType(event.currentTarget.value)
        }}
      >
        <option value="event">{t('event_shifts')}</option>
        <option value="project">{t('build_strike')}</option>
        <option value="lead">{t('lead_positions')}</option>
      </select>
      <select
        id='skillSelect'
        value={filters.skills || []}
        onChange={() => {}}
        className="custom-select"
        // data-none-selected-text="{__ 'filter_by_skill'}"
        // data-count-selected-text="{__ 'filter_selected_skill'} {0}/{1}"
        // data-selected-text-format="count > 2"
        // data-actions-box="true"
        multiple
      >
        {skills.map(skill => (
          <option
            key={skill.value}
            value={skill.value}
            onClick={() => selectHack('skills', skill.value)}
          >
            { skill.label }
          </option>
        ))}
      </select>
      <select
        id='quirkSelect'
        value={filters.quirks || []}
        onChange={() => {}}
        // data-none-selected-text="{__ 'filter_by_quirk'}"
        // data-count-selected-text="{__ 'filter_selected_quirk'} {0}/{1}"
        // data-selected-text-format="count > 2"
        // data-actions-box="true"
        multiple
      >
        {quirks.map(quirk => (
          <option
            key={quirk.value}
            value={quirk.value}
            onClick={() => selectHack('quirks', quirk.value)}
          >
            { quirk.label }
          </option>
        ))}
      </select>
      <select
        id='prioritySelect'
        value={filters.priorities || []}
        onChange={() => {}}
        // data-none-selected-text="{__ 'filter_by_priority'}"
        // data-count-selected-text="{__ 'filter_selected_priority'} {0}/{1}"
        // data-selected-text-format="count > 2"
        multiple
      >
        {['essential', 'important', 'normal'].map(value => (
          <option
            key={value}
            value={value}
            onClick={() => selectHack('priorities', value)}
          >
            {t(value)}
          </option>
        ))}
      </select>
      <SignupsList dutyType={dutyType} filters={filters} skills={skills} quirks={quirks} />
    </>
  )
}
