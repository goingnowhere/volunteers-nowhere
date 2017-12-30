
Template.publicDepartmentView.onCreated () ->
  template = this
  this.departmentId = template.data._id
  # XXX this should just fetch the teams of this dept
  template.subscribe("#{Volunteers.eventName}.Volunteers.organization")

Template.publicDepartmentView.helpers
  'teams': () ->
    template = Template.instance()
    Volunteers.Collections.Team.find({parentId: template.departmentId})
  canEditTeam: () =>
    template = Template.instance()
    Volunteers.isManagerOrLead(Meteor.userId(),template.departmentId)

Template.leadTeamView.onCreated () ->
  template = this
  template.teamId = template.data._id
  template.sub = template.subscribe("#{Volunteers.eventName}.Volunteers.allDuties.byTeam",template.teamId)
  template.stats = Volunteers.teamStats(template.teamId)
  template.currentDay = new ReactiveVar(Date())
  template.autorun () ->
    if template.sub.ready()
      teamShifts = Volunteers.Collections.TeamShifts.find(
        {parentId: template.teamId},
        {sort: { start: -1 }, limit: 1}).fetch()
      currentDay =
        if teamShifts.length >= 1
          moment(teamShifts[0].start).format('MMMM Do YYYY')
      template.currentDay.set(currentDay)

Template.leadTeamView.helpers
  'shiftRate': () -> Template.instance().stats.shiftRate()
  'volunteerNumber': () -> Template.instance().stats.volunteerNumber()
  'pendingRequests': () -> Template.instance().stats.pendingRequests.length
  'team': () -> Volunteers.Collections.Team.findOne(Template.instance().teamId)
  'currentDay': () -> Template.instance().currentDay.get()

Template.leadTeamView.events
  'click [data-action="settings"]': (event,template) ->
    team = Volunteers.Collections.Team.findOne(template.data._id)
    ModalShowWithTemplate("teamEdit",team)
  'click [data-action="applications"]': (event,template) ->
    unit = Volunteers.Collections.Team.findOne(template.data._id)
    ModalShowWithTemplate("teamSignupsList",{unit: unit})

Template.metaleadDepartmentView.onCreated () ->
  template = this
  departmentId = template.data._id
  template.subscribe("#{Volunteers.eventName}.Volunteers.department",departmentId)

Template.metaleadDepartmentView.events
  'click [data-action="settings"]': (event,template) ->
    dept = Volunteers.Collections.Department.findOne(template.data._id)
    ModalShowWithTemplate("departmentEdit",dept)
  'click [data-action="applications"]': (event,template) ->
    unit = Volunteers.Collections.Department.findOne(template.data._id)
    ModalShowWithTemplate("teamSignupsList",{unit: unit})
