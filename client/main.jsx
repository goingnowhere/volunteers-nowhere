import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import { Routes } from './router.jsx'
import '../imports/freelancer/css/freelancer.css'
import '../imports/css/custom.css'
import '../imports/freelancer/js/freelancer'

Meteor.startup(() => {
  render(<Routes />, document.getElementById('react-root'))
})
