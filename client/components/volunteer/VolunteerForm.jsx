import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Formik,
  Form,
  Field,
  FieldArray,
} from 'formik'
import Blaze from 'meteor/gadicc:blaze-react-component'

import { Volunteers } from '../../../both/init'
import { setLocale } from '../../../both/locale'
import { updateUserBio } from '../../../both/methods'
import { volunteerFormQs } from '../../../both/collections/users'
import { ImageUpload } from './volunteerForm/ImageUpload.jsx'
import { MultiSelect } from './volunteerForm/MultiSelect.jsx'

// TODO get from same place as schema
const languageOptions = [
  ['english', 'English'],
  ['french', 'French'],
  ['spanish', 'Spanish'],
  ['german', 'German'],
  ['italian', 'Italian'],
  ['other', 'Other'],
]
const foodOptions = [
  ['omnivore', 'Omnivore'],
  ['vegetarian', 'Vegetarian'],
  ['vegan', 'Vegan'],
  ['fish', 'Pescetarian (no meat, but fish ok)'],
]
const allergyOptions = [
  ['celiac', 'Gluten/Celiac'],
  ['shellfish', 'Fish/Shellfish'],
  ['nuts/peanuts', 'Peanuts/Nuts'],
  ['treenuts', 'Tree nuts'],
  ['soy', 'Soy'],
  ['egg', 'Egg'],
]
const intoleranceOptions = [
  ['gluten', 'Intolerance to gluten'],
  ['peppers', 'Fish/shellfish'],
  ['shellfish', 'Shellfish'],
  ['nuts', 'Peanuts/Nuts'],
  ['egg', 'Egg'],
  ['lactose', 'Milk/Lactose'],
  ['other', 'Other'],
]

const extractTicketId = (ticketString) => {
  const match = /^QTK(\d{8})$/.exec(ticketString.trim())
  if (match && match[1]) {
    return Number(match[1])
  }
  return undefined
}
const validateTicketId = async (ticketId) => new Promise((resolve, reject) => {
  const ticketIdNum = extractTicketId(ticketId)
  if (!ticketId) {
    resolve()
  } else if (!ticketIdNum) {
    resolve('Ticket ID must look like QTK12345678, find it at the top-right of your ticket')
  } else {
    Meteor.call('ticketId.check', ticketIdNum, (err, res) => {
      if (err) reject(err)
      if (res.isValid) resolve()
      else resolve('Ticket ID not found. Please check your ticket')
    })
  }
})

// Lots of copy-paste. Better than over-abstracting before we have a coherent plan for forms...
const VolunteerFormComponent = ({
  ready,
  user,
  existing,
  skills,
  quirks,
  onSubmit,
}) => {
  // Formik requires initialValues to be populated for some types, e.g. 'text'
  const defaultInitialValues = {
    ticketId: user.ticketId ? `QTK${user.ticketId}` : '',
    firstName: '',
    lastName: '',
    nickname: '',
    emergencyContact: '',
    // We need defaults for array values
    skills: [],
    quirks: [],
    allergies: [],
    intolerances: [],
    languages: [],
  }

  return (
    <div className="container mb-4">
      <div className="card mt-4 mb-4">
        <div className="card-body">
          <Blaze template="editEmails" />
        </div>
      </div>
      {ready && (
        <div className="row">
          <Formik
            initialValues={{
              ...defaultInitialValues,
              ...user.profile,
              ...existing,
            }}
            onSubmit={onSubmit}
            validateOnChange={false}
          >
            {({
              isSubmitting, values, setFieldValue, errors,
            }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="ticketId">Ticket ID</label>
                  <Field
                    id="ticketId"
                    type="text"
                    name="ticketId"
                    className={`form-control${errors.ticketId ? ' is-invalid' : ''}`}
                    placeholder="QTK12345678"
                    validate={validateTicketId}
                  />
                  {errors.ticketId && (
                    <p className='form-text text-danger'>
                      {errors.ticketId}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="nickname">Playa Name/FoD Name/Nickname</label>
                  <Field id="nickname" type="text" name="nickname" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-required" htmlFor="firstName">First Name</label>
                  <Field id="firstName" type="text" name="firstName" className="form-control" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <Field id="lastName" type="text" name="lastName" className="form-control" />
                </div>
                <div className="form-group">
                  <p className="mb-2">Language</p>
                  {[['en', 'English'], ['fr', 'Français'], ['es', 'Español']].map(([code, label]) => (
                    <div key={code} className="form-check form-check-inline">
                      <Field
                        id={`lang-${code}`}
                        type="radio"
                        name="language"
                        value={code}
                        className="form-check-input"
                        checked={values.language === code}
                      />
                      <label htmlFor={`lang-${code}`} className="form-check-label">{label}</label>
                    </div>
                  ))}
                </div>
                <ImageUpload
                  label="Set a picture so we can recognise you:"
                  onPicUploaded={pic => setFieldValue('picture', pic)}
                />
                <div className="form-group">
                  <label htmlFor="about">{volunteerFormQs.about}</label>
                  <Field
                    id="about"
                    component="textarea"
                    name="about"
                    rows="5"
                    className="form-control"
                  />
                  <small className="text-muted">
                    A bit of background about you. What are you good at?
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="experience">{volunteerFormQs.experience}</label>
                  <Field
                    id="experience"
                    component="textarea"
                    name="experience"
                    rows="3"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="skills">{volunteerFormQs.skills}</label>
                  <MultiSelect
                    id="skills"
                    options={skills}
                    selected={values.skills}
                    onChange={vals => setFieldValue('skills', vals)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="skills">{volunteerFormQs.quirks}</label>
                  <MultiSelect
                    id="quirks"
                    options={quirks}
                    selected={values.quirks}
                    onChange={vals => setFieldValue('quirks', vals)}
                  />
                </div>
                <div className="form-group">
                  <p>{volunteerFormQs.gender}</p>
                  <div className="form-check">
                    <label className="form-check-label">
                      <Field
                        type="radio"
                        value="male"
                        className="form-check-input"
                        aria-describedby="gender-help"
                        name="gender"
                        checked={values.gender === 'male'}
                      />
                      Male
                    </label>
                  </div>
                  <div className="form-check">
                    <label className="form-check-label">
                      <Field
                        type="radio"
                        value="female"
                        className="form-check-input"
                        aria-describedby="gender-help"
                        name="gender"
                        checked={values.gender === 'female'}
                      />
                      Female
                    </label>
                  </div>
                  <div className="form-check">
                    <label className="form-check-label">
                      <Field
                        type="radio"
                        value="other"
                        className="form-check-input"
                        aria-describedby="gender-help"
                        name="gender"
                        checked={values.gender === 'other'}
                      />
                      Other
                    </label>
                  </div>
                  <small id="gender-help" className="text-muted">
                    This info is only used for particular shifts where a gender balance is desirable.
                  </small>
                </div>
                <div className="form-group">
                  <p>{volunteerFormQs.languages}</p>
                  <FieldArray
                    name="languages"
                    render={arrayHelpers => languageOptions.map(([langVal, langLabel]) => (
                      <div key={langVal} className="form-check">
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            value={langVal}
                            className="form-check-input"
                            checked={values.languages.includes(langVal)}
                            onChange={e => (!e.target.checked
                              ? arrayHelpers.remove(values.languages.indexOf(langVal))
                              : arrayHelpers.push(langVal))}
                          />
                          {langLabel}
                        </label>
                      </div>
                    ))}
                  />
                </div>
                <div className="form-group">
                  <p className="mb-2">{volunteerFormQs.food}</p>
                  {foodOptions.map(([foodVal, foodLabel]) => (
                    <div key={foodVal} className="form-check">
                      <label className="form-check-label">
                        <Field
                          name="food"
                          type="radio"
                          value={foodVal}
                          className="form-check-input"
                          checked={values.food === foodVal}
                          aria-describedby="food-help"
                        />
                        {foodLabel}
                      </label>
                    </div>
                  ))}
                  <small id="food-help" className="text-muted">
                    The local producer we use for meat is not certified halal and our kitchen
                    is not kosher.
                  </small>
                </div>
                <div className="form-group">
                  <p>{volunteerFormQs.allergies}</p>
                  <FieldArray
                    name="allergies"
                    render={arrayHelpers => allergyOptions.map(([allergyVal, allergyLabel]) => (
                      <div key={allergyVal} className="form-check">
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            value={allergyVal}
                            className="form-check-input"
                            checked={values.allergies.includes(allergyVal)}
                            onChange={e => (!e.target.checked
                              ? arrayHelpers.remove(values.allergies.indexOf(allergyVal))
                              : arrayHelpers.push(allergyVal))}
                            aria-describedby="allergies-help"
                          />
                          {allergyLabel}
                        </label>
                      </div>
                    ))}
                  />
                  <small id="allergies-help" className="text-muted">
                    If you eat these we have to take you to the hospital.
                  </small>
                </div>
                <div className="form-group">
                  <p>{volunteerFormQs.intolerances}</p>
                  <FieldArray
                    name="intolerances"
                    render={arrayHelpers => intoleranceOptions.map(([intolVal, intolLabel]) => (
                      <div key={intolVal} className="form-check">
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            value={intolVal}
                            className="form-check-input"
                            checked={values.intolerances.includes(intolVal)}
                            onChange={e => (!e.target.checked
                              ? arrayHelpers.remove(values.intolerances.indexOf(intolVal))
                              : arrayHelpers.push(intolVal))}
                            aria-describedby="intolerances-help"
                          />
                          {intolLabel}
                        </label>
                      </div>
                    ))}
                  />
                  <small id="intolerances-help" className="text-muted">
                    You are not going to die if you come into contact with traces of these common
                    allergens. There might be contamination. Please be flexible and come talk to us for
                    very special requirements.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="medical">{volunteerFormQs.medical}</label>
                  <Field
                    id="medical"
                    name="medical"
                    component="textarea"
                    rows="3"
                    className="form-control"
                    aria-describedby="medical-help"
                  />
                  <small id="medical-help" className="text-muted">
                    This information is confidential and will be used only in case of emergency.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContact" className="form-required">{volunteerFormQs.emergencyContact}</label>
                  <Field
                    id="emergencyContact"
                    type="text"
                    name="emergencyContact"
                    className="form-control"
                    required
                    aria-describedby="emergency-help"
                  />
                  <small id="emergency-help" className="text-muted">
                    Name  contact number  languages spoken  relationship to you
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="anything">{volunteerFormQs.anything}</label>
                  <Field
                    id="anything"
                    name="anything"
                    component="textarea"
                    rows="3"
                    className="form-control"
                    aria-describedby="anything-help"
                  />
                  <small id="anything-help" className="text-muted">
                    Anything relevant you might want to tell us.
                  </small>
                </div>
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  Save
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  )
}

const submit = (user, history, location) => (formData, actions) => {
  setLocale(formData.language)
  updateUserBio.call({
    userId: user._id,
    ...formData,
    ticketId: user.ticketId ? undefined : extractTicketId(formData.ticketId),
  }, (err) => { if (err) console.error(err) }) // TODO proper error handling
  actions.setSubmitting(false)
  if (location.state && location.state.from) {
    history.push(location.state.from)
  } else {
    history.push('/dashboard')
  }
}

export const VolunteerForm = withRouter(withTracker(({ history, location }) => {
  const user = Meteor.user() || {}
  const ready = Meteor.subscribe(`${Volunteers.eventName}.Volunteers.volunteerForm`, user._id).ready()
    && Meteor.subscribe(`${Volunteers.eventName}.Volunteers.team`, {}).ready() // TODO Replace with a method
    // TODO make something like 'has ticket' generally available
    && Meteor.subscribe('user.extra', user._id).ready()

  const skills = Volunteers.collections.utils.getSkillsList()
  const quirks = Volunteers.collections.utils.getQuirksList()
  const { _id, ...existing } = Volunteers.collections.volunteerForm
    .findOne({ userId: user._id }) || {}
  return {
    user,
    ready,
    existing,
    skills,
    quirks,
    onSubmit: submit(user, history, location),
  }
})(VolunteerFormComponent))
