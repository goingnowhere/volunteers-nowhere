import React, { Fragment } from 'react'
import { withRouter, Link } from 'react-router-dom'

export const TermsCheckbox = withRouter(({ termsAgreed, checkTerms }) => (
  <Fragment>
    <div className="form-check">
      <input
        id="terms"
        type="checkbox"
        className="form-check-input"
        name="terms"
        checked={termsAgreed}
        onChange={checkTerms}
      />
      <label htmlFor="terms" className="form-check-label">
        I&apos;ve read and agree to the <Link to="/volunteers-agreement">Volunteer Code of Conduct</Link> and GDPR.
      </label>
    </div>
    <div className="mt-2">
      <p>GDPR Disclaimer: </p>
      <p>
        I consent to my data being stored for a period of up to 18 months from the last date my data
        was entered or modified, and for it to be used only to facilitate the scheduling and safety
        of volunteers on behalf of Nowhere (Europe) Ltd. I understand that you will delete my data
        within one month of my giving formal written notice to the registered address of Nowhere
        (Europe) Ltd, asking you to do so.
      </p>
    </div>
  </Fragment>
))
