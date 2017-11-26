Template.dashboard.onCreated () ->
  template = this
  template.autorun () ->
    template.sub = template.subscribe("test.allDuties.byUser")

# Template.dashboard.onRendered () ->
  # this.autorun () ->
  #   $('#shiftCalendar').fullCalendar('refetchEvents')
  #   $('#shiftCalendar').fullCalendar('refetchResources')
  #
  #   $('#taskCalendar').fullCalendar('refetchEvents')
  #   $('#taskCalendar').fullCalendar('refetchResources')

# signupCollections = (type) ->
#   if type == "shift" then Volunteers.ShiftSignups
#   else if type == "task" then Volunteers.TaskSignups
# resourcesA = (collection,type,filter = {},limit = 0) ->
#   collection.find(filter,{limit: limit}).forEach((job) ->
#     team = Volunteers.Team.findOne(job.parentId)
#     users = []
#     signupsSub = template.subscribe("test.signups.byShift",job._id)
#     if signupsSub.ready()
#       signupCollection = signupCollections[type]
#       users = signupCollection.find(
#           {shiftId: job._id, status: {$in: ["confirmed"]}}
#         ).map((s) -> s.userId)
#       signup = signupCollection.findOne({shiftId: job._id, userId: Meteor.userId()})
#       department = if team.parentId? then Volunteers.Department.findOne(team.parentId)
#       division = if department?.parentId? then Volunteers.Division.findOne(department.parentId)
#       mod =
#         teamId: team._id
#         shiftId: job._id
#         type: type
#         teamName: team.name
#         departmentName: if department?.name? then department.name
#         divisionName: if division?.name? then division.name
#         parentId: team.parentId
#         title: job.title
#         description: job.description
#         status: if signup then signup.status else null
#         canBail: signup? and signup.status != 'bailed'
#         policy: job.policy
#         tags: team.tags
#         rnd: Random.id()
#         users: users
#       if type == 'shift'
#         _.extend(mod,
#           start: job.start
#           end: job.end
#           startTime: job.startTime
#           endTime: job.endTime)
#       if type == 'task'
#         _.extend(mod,
#           dueDate : job.dueDate
#           estimatedTime: job.estimatedTime)
#       return mod
#     )
#
Template.dashboard.helpers
  'optionsShifts': () ->
    id: "shiftCalendar"
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    # editable: true
    # droppable: true
    scrollTime: '06:00'
    # slotDuration: "00:15"
    # defaultTimedEventDuration: "02:00"
    # forceEventDuration: true
    aspectRatio: 1.5
    defaultView: 'agendaWeek'
    # resourceAreaWidth: "20%"
    # resources: (callback) -> callback([])
    events: []
    # resources: (callback) ->
    #   resources = resourcesA(Volunteers.Shifts,'shifts').map((shift) ->
    #     id: shift._id
    #     title: shift.teamName
    #     resourceId: shift._id
    #   )
    #   callback(resources)
