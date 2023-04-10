import React from 'react'
import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { render } from 'react-dom'
import { Routes } from './router.jsx'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/collections/settings'
import '../imports/freelancer/css/freelancer.css'
import '../imports/css/custom.css'
import '../imports/freelancer/js/freelancer'

function Main() {
  // Use pub-sub here instead of methods as we want to watch for changes without passing 'reload'
  // everywhere
  const eventInfo = useTracker(() => {
    const settingsSub = Meteor.subscribe('eventSettings')
    return ({
      user: Meteor.user(),
      settings: EventSettings.findOne() || {},
      isLoaded: settingsSub.ready(),
    })
  }, [])
  return (
    <Routes {...eventInfo} />
  )
}

Meteor.startup(() => {
  const { Provider } = Volunteers.reactContext
  render(
    <Provider value={Volunteers}>
      <Main />
    </Provider>,
    document.getElementById('react-root'),
  )
})
