/* eslint-disable react/jsx-pascal-case */
import React from 'react'
import { Accounts, STATES } from 'meteor/piemonkey:accounts-ui'

const authForm = state => props => (
  <div className="container">
    <div className="row">
      <div className="col-md-12 col-md-offset-3">
        <Accounts.ui.LoginForm formState={state} {...props} />
      </div>
    </div>
  </div>
)

export const Login = authForm()
export const Signup = authForm(STATES.SIGN_UP)
export const Reset = authForm(STATES.PASSWORD_RESET)
export const Password = authForm(STATES.PASSWORD_CHANGE)
