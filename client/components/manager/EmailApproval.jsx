import { Meteor } from 'meteor/meteor'
import React, { useState, useEffect } from 'react'

import { T } from '../common/i18n'

export const EmailApproval = () => {
  const [emails, setEmails] = useState([])
  const reload = () => {
    Meteor.call('emailCache.get', (err, res) => {
      if (err) console.error(err)
      setEmails(res)
    })
  }
  useEffect(reload, [])

  const send = (emailId) => {
    Meteor.call('emailCache.send', { emailId }, (err) => {
      if (err) console.error(err)
      reload()
    })
  }
  const del = (emailId) => {
    Meteor.call('emailCache.delete', { emailId }, (err) => {
      if (err) console.error(err)
      reload()
    })
  }
  const reGen = (emailId) => {
    Meteor.call('emailCache.reGenerate', { emailId }, (err) => {
      if (err) console.error(err)
      reload()
    })
  }

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-md-2 bg-grey">
          <h3><T>email</T></h3>
        </div>
        <div className="col-md-10">
          <h2 className="header"><T>to_send</T></h2>
          {emails.map(({ _id: emailId, email }) => (
            <div key={emailId} className="card">
              <div className="card-body">
                <h5 className="card-title">To: {email.to}, Subject: {email.subject}</h5>
                <pre>
                  {email.text}
                </pre>
                <button type="button" className="btn btn-primary" onClick={() => send(emailId)}>
                  <T>send</T>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => del(emailId)}>
                  <T>remove</T>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => reGen(emailId)}>
                  <T>re-generate</T>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
