import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base'
import { Loading, TextField, useMethodCallData } from 'meteor/goingnowhere:volunteers'
import { useForm } from 'react-hook-form'

import { TermsCheckbox } from './TermsCheckbox.jsx'
import { t, T } from '../common/i18n'

export function Magic({ user }) {
  const history = useHistory()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const hash = searchParams.get('hash')
  const [checkResult, isLoaded] = useMethodCallData('accounts.fistbump.check', { hash })

  const [email, setEmail] = useState('')
  const [error, setError] = useState()
  const [termsAgreed, checkTerms] = useState(false)
  useEffect(() => {
    let failureListener
    if (isLoaded && checkResult) {
      setEmail(checkResult.email)
      failureListener = Accounts.onLoginFailure(err => setError(err.error))
    }
    return () => failureListener?.stop()
  }, [isLoaded, checkResult])

  useEffect(() => {
    if (user) {
      // We've logged in!
      history.push('/dashboard')
    }
  }, [history, user])

  const {
    register, handleSubmit, formState: { errors, isValid },
  } = useForm({ values: { email } })
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
            registerProps={register('email', { required: true, disabled: true })}
            error={errors.email ? t(`email_error_${errors.email.type}`) : false}
          />
          <TextField
            label={t('password')}
            type="password"
            registerProps={register('password', { required: true })}
            error={errors.email ? t(`password_error_${errors.email.type}`) : false}
          />
          <TermsCheckbox termsAgreed={termsAgreed} checkTerms={checkTerms} />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid || !termsAgreed}
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
