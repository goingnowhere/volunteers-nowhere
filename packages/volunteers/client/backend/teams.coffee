Template.teamForm.onCreated () ->
  this.subscribe('Volunteers.users')
  this.subscribe('Volunteers.teams')

Template.teamForm.helpers
  Teams: () -> share.Teams

Template.teamForm.events
  'click [data-action="removeTeam"]': (event,template) ->
    teamId = $(event.target).data('id')
    Meteor.call "Teams.remove", teamId

Template.teamsShifts.onCreated () ->
  template = this
  template.subscribe('Volunteers.teams')
  template.subscribe('Volunteers.shifts')
  template.subscribe('Volunteers.users')

Template.teamsShifts.helpers
  'teams': () -> share.Teams.find().fetch()
  'getShiftUsers': (shiftId) ->
    shift = share.Shifts.findOne({shiftId: shiftId})
    console.log shiftId
    console.log shift
    if shift?.usersId
      _.map(shift.usersId, (userId) -> Meteor.users.findOne(userId) )

# we need this hook to transform the date from autoform in something
# that the date picker can shallow. This should be done by the datetimepicker
# parsing function, but I'm not able to make it work
AutoForm.addHooks 'updateTeamsForm',
  docToForm: (doc) ->
    if doc.shifts?
      for shift,i in doc.shifts
        doc.shifts[i].start = moment(shift.start).format("DD-MM-YYYY HH:mm")
        doc.shifts[i].end = moment(shift.end).format("DD-MM-YYYY HH:mm")
    if doc.tasks?
      for task,i in doc.tasks
        doc.tasks[i].dueDate = moment(task.dueDate).format("DD-MM-YYYY")
    return doc
