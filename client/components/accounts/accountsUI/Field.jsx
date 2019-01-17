import React from 'react'
import { Accounts } from 'meteor/piemonkey:accounts-ui'

export class Field extends Accounts.ui.Field {
  render() {
    const {
      id,
      hint,
      label,
      type = 'text',
      onChange,
      required = false,
      defaultValue = '',
      message,
    } = this.props
    return (
      <div className="form-group">
        <label className="control-label" htmlFor={id}>
          {label}
        </label>
        <input
          ref={(ref) => { this.input = ref }}
          type={type}
          className="form-control"
          id={id}
          name="at-field-email"
          placeholder={hint}
          autoCapitalize="none"
          autoCorrect="off"
          required={required}
          onChange={onChange}
          defaultValue={defaultValue}
        />
        {message && <span className={`help-block ${message.type}`}>{message.message}</span>}
      </div>
    )
  }
}

Accounts.ui.Field = Field
