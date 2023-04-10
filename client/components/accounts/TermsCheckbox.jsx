import React, { Fragment } from 'react'

// TODO When replacing accounts pages put this into event settings
const AGREEMENT_URL = 'https://drive.google.com/file/d/1KNrS-k4KZxKK7sroGkrTvlsNTuw0buJs/view'

export const TermsCheckbox = ({ termsAgreed, checkTerms }) => (
  <>
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
        I&apos;ve read and agree to the&nbsp;
        <a href={AGREEMENT_URL} target="_blank" to="/volunteers-agreement" rel="noreferrer">
          Volunteer Code of Conduct
        </a> and GDPR.
      </label>
    </div>
    <div className="mt-2">
      <p>GDPR Disclaimer: </p>
      <p>
        I consent to my data being stored for a period of up to 18 months from the last date my data
        was entered or modified, and for it to be used only to facilitate the scheduling and safety
        of volunteers on behalf of Going Nowhere S.L. I understand that you will delete my data
        within one month of my giving formal written notice to the registered address of Going
        Nowhere S.L., asking you to do so.
      </p>
    </div>
  </>
)
