Meteor.methods 'VolunteerForm.remove': (doc) ->
  console.log "Volunteer.removeForm"
  check(doc,Object)
  userId = Meteor.userId()
  if (userId == doc.userId) || Roles.userIsInRole(userId, [ 'manager' ])
    share.form.get().remove(doc._id)

Meteor.methods 'VolunteerForm.update': (doc,formId) ->
  console.log ["Volunteer.updateForm",doc]
  check(doc,share.form.get().simpleSchema())
  check(formId,String)
  userId = Meteor.userId()
  if (userId == doc.userId) || Roles.userIsInRole(userId, [ 'manager' ])
    share.form.get().update(formId,doc)

Meteor.methods 'VolunteerForm.insert': (doc) ->
  console.log ["Volunteer.addForm",doc]
  check(doc,share.form.get().simpleSchema())
  if Meteor.userId()
    doc.userId = Meteor.userId()
    share.form.get().insert(doc)

Meteor.methods 'VolunteerShift.remove': (formId) ->
  console.log ["VolunteerBackend.removeShiftForm",formId]
  check(formId,String)
  userId = Meteor.userId()
  if Roles.userIsInRole(userId, [ 'manager' ])
    share.VolunteerShift.remove(formId)

Meteor.methods 'VolunteerShift.update': (doc,formId) ->
  console.log ["VolunteerBackend.updateShiftForm",doc, formId]
  check(doc,share.Schemas.VolunteerShift)
  check(formId,String)
  userId = Meteor.userId()
  if Roles.userIsInRole(userId, [ 'manager' ])
    share.VolunteerShift.update formId, doc, (e,r) ->

Meteor.methods 'VolunteerShift.insert': (doc) ->
  console.log ["VolunteerBackend.insertShiftForm",doc]
  check(doc,share.Schemas.VolunteerShift)
  userId = Meteor.userId()
  if Roles.userIsInRole(userId, [ 'manager' ])
    share.VolunteerShift.insert doc, (e,r) ->
