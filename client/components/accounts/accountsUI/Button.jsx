/* eslint-disable react/button-has-type */
import React, { memo } from 'react'
import {
  Link,
} from 'react-router-dom'
import { Accounts } from 'meteor/piemonkey:accounts-ui'

const buttonTexts = {
  switchToSignUp: 'Don\'t have an account?',
}

export const Button = memo(({
  id,
  label,
  href,
  type = 'button',
  disabled = false,
  className = '',
  onClick,
}) => (type === 'link' && href ? (
  <div className="at-signup-link">
    <p>
      {buttonTexts[id] && `${buttonTexts[id]} `}
      <Link to={href}>{label}</Link>
    </p>
  </div>
) : (
  <button
    type={type}
    className={`at-btn submit btn btn-lg btn-block btn-light ${className}`}
    disabled={disabled}
    onClick={onClick}
  >
    {label}
  </button>
)))
Accounts.ui.Button = Button
