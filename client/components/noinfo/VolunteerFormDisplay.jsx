import React, { Fragment } from 'react'
import { volunteerFormQs } from '../../../both/collections/users'

const displayAnswer = answer => (answer instanceof Array
  ? (<ul>{answer.map(ans => <li key={ans}>{ans}</li>)}</ul>)
  : answer
)

export const VolunteerFormDisplay = ({ form }) => (
  <dl>
    {form && Object.keys(volunteerFormQs).map(key => (
      <Fragment key={key}>
        <dt>{volunteerFormQs[key]}</dt>
        <dd>{displayAnswer(form[key])}</dd>
      </Fragment>
    ))}
  </dl>
)
