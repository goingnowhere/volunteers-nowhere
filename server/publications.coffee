import { Volunteers } from '/both/init'

Meteor.publish "#{Volunteers.eventName}.allUsers", () ->
  # XXX there should be a way to publish only those
  # users that signed up for this event, but not others.
  if Volunteers.isManager then Meteor.users.find()
