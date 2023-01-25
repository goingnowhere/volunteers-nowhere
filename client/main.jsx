import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import { Routes } from './router.jsx'
import { Volunteers } from '../both/init'
import '../imports/freelancer/css/freelancer.css'
import '../imports/css/custom.css'
import '../imports/freelancer/js/freelancer'

Meteor.startup(() => {
  const { Provider } = Volunteers.reactContext
  render(
    <Provider value={Volunteers}>
      <Routes />
    </Provider>,
    document.getElementById('react-root'),
  )
})
