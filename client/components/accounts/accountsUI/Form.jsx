/* eslint-disable react/jsx-pascal-case */
import React from 'react'
import i18n from 'meteor/universe:i18n'
import { Accounts, STATES } from 'meteor/piemonkey:accounts-ui'
import { TermsCheckbox } from '../TermsCheckbox.jsx'
import { T, t } from '../../common/i18n'

export class Form extends Accounts.ui.Form {
  constructor(props) {
    super(props)
    this.state = {
      language: 'en',
      termsAgreed: false,
    }
  }

  checkTerms = event => this.setState({ termsAgreed: event.target.checked })

  changeLang(event) {
    const language = event.target.value
    i18n.setLocale(language)
    this.setState({ language })
  }

  render() {
    const {
      fields,
      buttons: propButtons,
      messages,
      ready = true,
      className,
      formState,
    } = this.props
    const { termsAgreed } = this.state
    const buttons = Object.fromEntries(Object.entries(propButtons).map(([key, button]) => {
      if (button.type === 'submit') {
        return [key, {
          ...button,
          disabled: formState === STATES.SIGN_UP && !termsAgreed,
          onClick: () => button.onClick({ language: this.state.language }),
        }]
      }
      return [key, button]
    }))
    const translatedFields = Object.fromEntries(Object.entries(fields)
      .map(([key, field]) => ([key, {
        ...field,
        label: t(field.id),
        hint: t(`${field.id}_hint`),
      }])))
    const translatedButtons = Object.fromEntries(Object.entries(buttons)
      .map(([key, button]) => ([key, {
        ...button,
        label: t(button.id),
      }])))

    return formState === STATES.PROFILE ? (
      <p><T>verify_email</T></p>
    ) : (
      <form
        ref={(ref) => { this.form = ref }}
        className={[className, ready ? 'ready' : null].join(' ')}
        noValidate
      >
        {formState === STATES.SIGN_UP && (
          <div className="form-group">
            <p className="mb-2">Language</p>
            {[['en', 'English'], ['fr', 'Français'], ['es', 'Español']].map(([code, label]) => (
              <div key={code} className="form-check form-check-inline">
                <input
                  id={`lang-${code}`}
                  type="radio"
                  name="language"
                  value={code}
                  className="form-check-input"
                  checked={this.state.language === code}
                  onChange={this.changeLang.bind(this)}
                />
                <label htmlFor={`lang-${code}`} className="form-check-label">{label}</label>
              </div>
            ))}
          </div>
        )}
        <Accounts.ui.Fields fields={translatedFields} />
        {formState === STATES.SIGN_UP
          && <TermsCheckbox termsAgreed={termsAgreed} checkTerms={this.checkTerms} />}
        <Accounts.ui.Buttons buttons={translatedButtons} />
        <Accounts.ui.FormMessages messages={messages} />
      </form>
    )
  }
}

Accounts.ui.Form = Form
