Meteor.methods 'Teams.remove': (teamId) ->
  console.log "Teams.remove"
  check(teamId,String)
  if Roles.userIsInRole(Meteor.userId(), [ 'manager' ])
    console.log "Remove all shifts related to this team"
    share.Teams.remove(teamId)

Meteor.methods 'Teams.insert': (doc) ->
  console.log ["Teams.insert",doc]
  check(doc,share.Schemas.Teams)
  if Roles.userIsInRole(Meteor.userId(), [ 'manager' ])
    share.Teams.insert(doc)

Meteor.methods 'Teams.update': (doc,formId) ->
  console.log ["Teams.update",doc, formId]
  check(doc,share.Schemas.Teams)
  check(formId,String)
  if Roles.userIsInRole(Meteor.userId(), [ 'manager' ])
    share.Teams.update(formId,doc)

Meteor.methods 'Shifts.upsert': (sel,op,userId) ->
  console.log ["Shifts.upsert",sel,op,userId]
  # check(sel,{teamId:String,shiftId:String})
  uid = Meteor.userId()
  if (userId == uid) || (Roles.userIsInRole(uid, [ 'manager' ]))
    shifts = share.Shifts.findOne(sel)
    if shifts
      mod =
        if op == "push" then {$addToSet: {usersId: userId}}
        else if op == "pull" then {$pull: {usersId: userId}}
        else {}
      share.Shifts.update(shifts._id,mod)
    else
      share.Shifts.update(sel,{$set: {usersId: [userId]}},{upsert: true})

Meteor.methods 'Shifts.remove': (shiftId) ->
  console.log ["Shifts.remove",shiftId]
  check(shiftId,String)
  uid = Meteor.userId()
  if (userId == uid) || (Roles.userIsInRole(uid, [ 'manager' ]))
    share.Shifts.remove(shiftId)

Meteor.methods 'Tasks.upsert': (teamId,taskId,userId) ->
  console.log ["Tasks.upsert",teamId,taskId,userId]
  check(teamId,String)
  check(taskId,String)
  check(userId,String)
  uid = Meteor.userId()
  if (userId == uid) || (Roles.userIsInRole(uid, [ 'manager' ]))
    share.Tasks.upsert({teamId:teamId,taskId:taskId},{$addToSet:{usersId: userId}})

Meteor.methods 'Tasks.remove': (taskId) ->
  console.log ["Tasks.remove",taskId]
  check(taskId,String)
  uid = Meteor.userId()
  if (userId == uid) || (Roles.userIsInRole(uid, [ 'manager' ]))
    share.Tasks.remove(taskId)
