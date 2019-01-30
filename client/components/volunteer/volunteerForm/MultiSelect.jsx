import React from 'react'
import Select from 'react-select'

export const MultiSelect = ({
  id,
  options,
  selected,
  onChange,
}) => (
  <Select
    id={id}
    isMulti
    closeMenuOnSelect={false}
    // Needed for menu to stay open on touch devices
    blurInputOnSelect={false}
    options={options}
    onChange={picked => onChange(picked.map(pick => pick.value))}
    // We could make a lookup map by value if we don't want labels to be the same
    value={selected.map(value => ({ value, label: value }))}
  />
)
