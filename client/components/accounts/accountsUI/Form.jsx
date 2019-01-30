import React from 'react'
import { Accounts, STATES } from 'meteor/piemonkey:accounts-ui'
import { TermsCheckbox } from '../TermsCheckbox.jsx'

export class Form extends Accounts.ui.Form {
  constructor(props) {
    super(props)
    this.state = {
      termsAgreed: false,
    }
  }

  checkTerms = event => this.setState({ termsAgreed: event.target.checked })

  render() {
    const {
      fields,
      buttons,
      messages,
      ready = true,
      className,
      formState,
    } = this.props
    const { termsAgreed } = this.state
    Object.keys(buttons).forEach((i) => {
      if (buttons[i].type === 'submit') {
        buttons[i].disabled = formState === STATES.SIGN_UP && !termsAgreed
      }
    })
    return (
      <form
        ref={(ref) => { this.form = ref }}
        className={[className, ready ? 'ready' : null].join(' ')}
        noValidate
      >
        <Accounts.ui.Fields fields={fields} />
        {formState === STATES.SIGN_UP
          && <TermsCheckbox termsAgreed={termsAgreed} checkTerms={this.checkTerms} />}
        <Accounts.ui.Buttons buttons={buttons} />
        <Accounts.ui.FormMessages messages={messages} />
      </form>
    )
  }
}

Accounts.ui.Form = Form
