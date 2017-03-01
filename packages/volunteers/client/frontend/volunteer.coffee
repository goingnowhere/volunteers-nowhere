periods=[
  {start:'01:00',end: '05:00'},
  {start:'05:00',end: '09:00'},
  {start:'09:00',end: '13:00'},
  {start:'13:00',end: '17:00'},
  {start:'17:00',end: '21:00'},
  {start:'21:00',end: '01:00'}]

defaultDayS = [
  {day:"2017-01-11", isChecked: "checked"},
  {day:"2017-01-12"}
]
defaultDay = "2017-01-11"

Template.registerHelper 'formatDate', (date) ->
  moment(date).format("DD-MM-YYYY")

Template.registerHelper 'formatTime', (date) ->
  moment(date).format("H:mm")

Template.volunteerForm.onCreated () ->
  this.subscribe('Volunteers.volunteerForm')
  this.subscribe('Volunteers.teams')

Template.volunteerForm.helpers
  VolunteerForm: () ->
    console.log share.form.get()
    share.form.get()

Template.volunteerShiftForm.onCreated () ->
  template = Template.instance()

  template.searchQuery = new ReactiveDict()
  template.ShiftsLocal = new Mongo.Collection(null)

  template.searchQuery.set('filter',[])
  template.searchQuery.set('day',defaultDay)

  template.subscribe('Volunteers.shifts')
  template.subscribe('Volunteers.tasks')

Template.volunteerShiftForm.onRendered () ->
  template = Template.instance()
  userId = Meteor.userId()
  sub = template.subscribe('teams')

  template.autorun () ->
    if sub.ready()
      for team in share.Teams.find().fetch()
        if team.shifts
          for shift in team.shifts
            sel = {teamId:team._id,shiftId: shift._id,usersId: {$in: [userId]}}
            isChecked = if share.Shifts.findOne(sel) then "checked" else null
            sel =
              teamId: team._id
              shiftId: shift._id
            mod =
              name: team.name
              title: shift.title
              start: shift.start
              end: shift.end
              isChecked: isChecked
              rnd: Random.id()
            template.ShiftsLocal.upsert(sel,{$set: mod})

Template.volunteerShiftForm.helpers
  'searchQuery': () -> Template.instance().searchQuery
  'teamsAvailable': () ->
    filter = Template.instance().searchQuery.get('filter')
    sel =
      if filter.length > 0
        sel = []
        for f in filter
          range = moment.range(f)
          sel.push
            $and: [
              {start: { $gte: range.start.toDate() }},
              {start: { $lt: range.end.toDate() }}
            ]
        {"$or": sel}
      else
        day = Template.instance().searchQuery.get('day')
        start = moment(day)
        end = start.clone().add({hours:23, minutes: 59})
        console.log "dayPlus",start.toDate(), end.toDate()
        {start: { $gte: start.toDate()}, end: { $lt: end.toDate() }}
    console.log "AAAAAAAA",sel
    l = Template.instance().ShiftsLocal.find(sel).fetch()
    console.log l
    l

Template.volunteerShiftForm.events
  'change [data-type="toggleShift"]': ( event, template ) ->
    checked = event.target.checked
    shiftId = $(event.target).data('shiftid')
    teamId = $(event.target).data('teamid')
    userId = Meteor.userId()
    sel = {teamId:teamId,shiftId:shiftId}
    op = if checked == false then "pull" else "push"
    console.log "upsert",sel
    Meteor.call "Shifts.upsert", sel, op, userId

Template.dayFilter.events

  # 'click [name="tagFilter"]': ( event, template ) ->
  #   # this one is a select2
  #   values = event.target.value.trim()
  #
  #   if (values != [])
  #     for s in values
  #       template.searchQuery.set('tagFilter',s)
  #     template.searching.set( true )
  #
  #   if value == []
  #     template.searchQuery.set('dayFilter',null)

  'change [name="periodFilter"]': ( event, template ) ->
    checkbox = event.target
    searchQuery = template.data.searchQuery
    a = searchQuery.get('filter')
    range = checkbox.value
    if checkbox.checked
      a.push(range)
      searchQuery.set('filter',a)
    else
      index = a.indexOf(range)
      if (index > -1)
        a.splice(index, 1)
        searchQuery.set('filter',a)

Template.dayFilter.helpers
  'periods': () -> periods

Template.multiDayFilter.onRendered () ->
  $(".dayfilter").hide()
  $("##{defaultDay}-filter").show()

Template.multiDayFilter.helpers
  'days': () -> defaultDayS
  'searchQuery': () -> Template.instance().data.searchQuery

Template.multiDayFilter.events
  'change [name="dayFilter"]': (event, template) ->
    day = event.target.value
    console.log "day",day
    Template.instance().data.searchQuery.set('day',day)
    Template.instance().data.searchQuery.set('filter',[])
    $(".dayfilter").hide()
    $("##{day}-filter").show()

# Template.volunteerList.helpers
#   "isVolunteer": () ->
#     VolunteerForm.find({userId: Meteor.userId()}).count() > 0
#   "hasLead": () ->
#     roles = AppRoles.find({withShifts:false}).map((e) -> e._id)
#     crew = VolunteerCrew.find({userId:Meteor.userId(),roleId:{$in: roles}})
#     crew.count() > 0
#   "hasShift": () ->
#     roles = AppRoles.find({withShifts:true}).map((e) -> e._id)
#     crew = VolunteerCrew.find({userId:Meteor.userId(),roleId:{$in: roles}})
#     crew.count() > 0
#   'VolunteerCrewUserTableSettings': () ->
#     roles = AppRoles.find({withShifts:false}).map((e) -> e._id)
#     collection: VolunteerCrew.find({userId:Meteor.userId(),roleId:{$in: roles}})
#     # currentPage: Template.instance().currentPage
#     class: "table table-bordered table-hover"
#     showNavigation: 'never'
#     rowsPerPage: 20
#     showRowCount: false
#     showFilter: false
#     fields: [
#       {
#         key: 'roleId',
#         label: (() -> TAPi18n.__("role")),
#         fn: (val,row,label) ->
#           TAPi18n.__(AppRoles.findOne(val).name)},
#       {
#         key: 'areaId',
#         label: (() -> TAPi18n.__("area")),
#         fn: (val,row,label) ->
#           TAPi18n.__(Areas.findOne(val).name)},
#     ]
#   'VolunteerShiftUserTableSettings': () ->
#     crews = VolunteerCrew.find({userId: Meteor.userId()}).map((res) -> res._id)
#     collection: VolunteerShift.find({crewId: {$in: crews}})
#     # currentPage: Template.instance().currentPage
#     class: "table table-bordered table-hover"
#     showNavigation: 'never'
#     rowsPerPage: 20
#     showRowCount: false
#     showFilter: false
#     fields: [
#       {
#         key: 'role',
#         label: (() -> TAPi18n.__("role")),
#         fn: (val,row,label) ->
#           roleId = VolunteerCrew.findOne(row.crewId).roleId
#           TAPi18n.__(AppRoles.findOne(roleId).name)},
#       {
#         key: 'area',
#         label: (() -> TAPi18n.__("area")),
#         fn: (val,row,label) ->
#           areaId = VolunteerCrew.findOne(row.crewId).areaId
#           TAPi18n.__(Areas.findOne(areaId).name)},
#       {
#         key: 'teamId',
#         label: (() -> TAPi18n.__("team")),
#         fn: (val,row,label) ->
#           if val then TAPi18n.__(Teams.findOne(val).name)
#         cellClass: "volunteer-task-td"},
#       { key: 'start', label: (() -> TAPi18n.__("start"))},
#       { key: 'end', label: (() -> TAPi18n.__("end"))},
#       {
#         key: 'leadId',
#         label: (() -> TAPi18n.__("leads")),
#         fn: (val,row,label) ->
#           areaId = VolunteerCrew.findOne(row.crewId).areaId
#           _.map(getAreaLeads(areaId),(l) ->getUserName(l.userId))
#       },
#     ]
#
# Template.publicVolunteerCal.onCreated () ->
#   area = Areas.findOne()
#   Session.set('currentAreaTab',{areaId:area._id})
#
# Template.publicVolunteerCal.helpers
#   'currentAreaTab': () -> Session.get('currentAreaTab')
#   'areas': () -> Areas.find().fetch()
#   'options': () ->
#     id: "publicVolunteerAreaCal"
#     schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
#     scrollTime: '06:00'
#     slotDuration: "00:15"
#     aspectRatio: 1.5
#     now: Settings.findOne().dday
#     locale: Meteor.user().profile.language
#     defaultView: 'timelineDay'
#     views:
#       timelineThreeDays:
#         type: 'timeline'
#         duration: { days: 2 }
#     header:
#       right: 'timelineTwoDays, timelineDay, prev,next'
#     resourceLabelText: TAPi18n.__ "teams"
#     resourceAreaWidth: "20%"
#     resources: (callback) ->
#       areaId = Session.get('currentAreaTab').areaId
#       businessHours = (team) ->
#         _.map(team.shifts, (shift) -> {
#           start: shift.start,
#           end: shift.end,
#           dow: [0, 1, 2, 3, 4, 5, 6]
#         })
#       resources = Teams.find({areaId:areaId}).map((team) ->
#         id: team._id
#         resourceId: team._id
#         title: team.name
#         businessHours: businessHours(team))
#       callback(resources)
#     events: (start, end, tz, callback) ->
#       areaId = Session.get('currentAreaTab').areaId
#       events = VolunteerShift.find({areaId:areaId}).map((res) ->
#         title: getUserName(VolunteerCrew.findOne(res.crewId).userId)
#         resourceId: res.teamId # this is the fullCalendar resourceId / Team
#         crewId: res.crewId
#         userId: res.userId
#         eventId: res._id
#         start: moment(res.start, "DD-MM-YYYY H:mm")
#         end: moment(res.end, "DD-MM-YYYY H:mm"))
#       callback(events)
#
# Template.publicVolunteerCal.events
#   'click [data-action="switchTab"]': (event,template) ->
#     areaId = $(event.target).data('id')
#     Session.set('currentAreaTab',{areaId:areaId})
#     $('#publicVolunteerAreaCal').fullCalendar('refetchEvents')
#     $('#publicVolunteerAreaCal').fullCalendar('refetchResources')
#
# AutoForm.hooks
#   insertVolunteerForm:
#     onSuccess: () ->
#       sAlert.success(TAPi18n.__('alert_success_update_volunteer_form'))
#       Session.set("currentTab",{template: 'volunteerList'})
#   updateVolunteerForm:
#     onSuccess: () ->
#       sAlert.success(TAPi18n.__('alert_success_update_volunteer_form'))
#       Session.set("currentTab",{ template: 'volunteerList'})
