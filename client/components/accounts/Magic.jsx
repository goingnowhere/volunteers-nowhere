import { Meteor } from 'meteor/meteor'
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base'
import {
  emailRegex,
  Loading,
  TextField,
  useMethodCallData,
} from 'meteor/goingnowhere:volunteers'
import { useForm } from 'react-hook-form'

import { TermsCheckbox } from './TermsCheckbox.jsx'
import { t, T } from '../common/i18n'
import { MIN_PWD_LENGTH } from '../../../both/accounts'

export function Magic({ user }) {
  const history = useHistory()
  const { search } = useLocation()
  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  const hash = searchParams.get('fornothing')
  const [checkResult, isLoaded] = useMethodCallData('accounts.fistbump.check', { hash })

  const successRedirect = searchParams.get('path') || 'dashboard'

  const [email, setEmail] = useState('')
  const [error, setError] = useState()
  const [termsAgreed, checkTerms] = useState(false)
  useEffect(() => {
    let failureListener
    if (isLoaded && checkResult) {
      if (checkResult.existingUser) {
        Meteor.connection.setUserId(checkResult.existingUser._id)
      }
      setEmail(checkResult.email)
      failureListener = Accounts.onLoginFailure(err => setError(err.error))
    }
    return () => failureListener?.stop()
  }, [isLoaded, checkResult])

  useEffect(() => {
    if (user) {
      // We've logged in!
      searchParams.delete('fornothing')
      searchParams.delete('path')
      history.push(`/${successRedirect}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`)
    }
  }, [history, user, successRedirect, searchParams])

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({ mode: 'onTouched', values: { email } })
  const onSubmit = ({ password }) => {
    const toCreate = {
      email,
      password,
      fistbumpHash: hash,
      profile: {
        ticketId: checkResult.ticketId,
      },
    }
    Accounts.createUser(toCreate)
  }

  return (
    <section className="container mt-3">
      <p><T>magiclink_welcome</T></p>
      {!isLoaded ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label={t('email')}
            type="email"
            registerProps={register('email', {
              required: true,
              pattern: emailRegex,
              disabled: true,
            })}
            error={errors.email ? t(`email_error.${errors.email.type}`) : false}
          />
          <TextField
            label={t('newPassword')}
            type="password"
            registerProps={register('password', { required: true, minLength: MIN_PWD_LENGTH })}
            error={errors.password ? t(`password_error.${errors.password.type}`) : false}
          />
          <TermsCheckbox termsAgreed={termsAgreed} checkTerms={checkTerms} />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!termsAgreed}
          >
            <T>submit</T>
          </button>
          {error && (
            <p className="text-danger">
              {error.message}
            </p>
          )}
        </form>
      ) }
    </section>
  )
}
