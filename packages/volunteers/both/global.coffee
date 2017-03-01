share.getUserName = (userId) ->
  user = Meteor.users.findOne(userId)
  if user
    if (user.profile?.firstName)
      "#{user.profile.firstName}"
    else if user.profile?.lastName?
      "#{user.profile.lastName}"
    else user.emails[0].address

share.getUserEmail = (userId) ->
  user = Meteor.users.findOne(userId)
  user.emails[0].address
