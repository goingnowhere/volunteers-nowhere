import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'


export class VerifyEmail extends Component {
  state = { sent: false }

  requestEmail = () => {
    Meteor.call('sendVerificationEmail')
    this.setState({ sent: true })
  }

  render() {
    const { sent } = this.state
    return (
      <div className="container">
        <div className="row">
          <p>You need to verify your email address before continuing.</p>
          <button type="button" className="btn btn-lg btn-block btn-light" onClick={this.requestEmail} disabled={sent}>
            {sent ? 'Email sent' : 'Request another email'}
          </button>
        </div>
      </div>
    )
  }
}
