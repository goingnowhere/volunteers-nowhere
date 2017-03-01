


# rowApplicationStatus = (vol) ->
#   crew = VolunteerCrew.find({userId:vol.userId}).count()
#   if crew == 0 then "bg-warning" else "bg-success"
#
# Template.volunteerBackendFilter.onCreated () ->
#   this.carFilter = new ReactiveTable.Filter('checkbox-car-filter', [ 'car' ])
#   this.cookingFilter = new ReactiveTable.Filter('checkbox-cooking-filter', [ 'cooking' ])
#
# Template.volunteerBackendFilter.events
#   'change #user-cooking-filter': (event, template) ->
#     if $(event.target).is(':checked')
#       template.cookingFilter.set 'true'
#     else
#       template.cookingFilter.set ''
#
#   'change #user-car-filter': (event, template) ->
#     if $(event.target).is(':checked')
#       template.carFilter.set 'true'
#     else
#       template.carFilter.set ''
#
# Template.volunteerBackend.onCreated () ->
#   this.currentResource = new ReactiveVar({})
#   this.showAreaSlider = new ReactiveVar(false)
#   # this.currentPage = new ReactiveVar(Session.get('current-page') || 0)
#
# Template.volunteerBackend.helpers
#   'showAreaSlider': () -> Template.instance().showAreaSlider.get()
#   'currentResource': () -> Template.instance().currentResource.get()
#   'usernameFilterFields': () -> ["username"]
#   'VolunteerTableSettings': () ->
#     collection: VolunteerForm.find().map((e) ->
#       _.extend(e,{username:getUserName(e.userId)} )
#     )
#     # currentPage: Template.instance().currentPage
#     id: "VolunteerTableID"
#     class: "table table-bordered table-hover"
#     showNavigation: 'auto'
#     rowsPerPage: 20
#     showRowCount: true
#     showFilter: false
#     rowClass: rowApplicationStatus
#     filters: [
#       # "checkbox-car-filter",
#       # "checkbox-cooking-filter",
#       "username-filter"
#     ]
#     fields: [
#       { key: 'username', label: (() -> TAPi18n.__("name")) },
#       {
#         key: 'roles',
#         label: (() -> TAPi18n.__("shifts")),
#         fn: (val,row,key) -> VolunteerCrew.find({userId:row.userId}).count()
#       },
#       { key: 'car', label: "", hidden: true},
#       { key: 'cooking', label: "", hidden: true}
#     ]
#
#   'VolunteerCrewTableSettings': () ->
#     currentResource = Template.instance().currentResource.get()
#     userId = if currentResource.data then currentResource.data.userId else null
#     collection: VolunteerCrew.find({userId:userId})
#     # currentPage: Template.instance().currentPage
#     id: "VolunteerCrewTableID"
#     class: "table table-bordered table-hover"
#     showNavigation: 'never'
#     rowsPerPage: 20
#     showRowCount: false
#     showFilter: false
#     fields: [
#       {
#         key: 'roleId',
#         label: (() -> TAPi18n.__("role")),
#         fn: (val,row,key) -> TAPi18n.__ (AppRoles.findOne(val).name)},
#       {
#         key: 'areaId',
#         label: (() -> TAPi18n.__("area")),
#         fn: (val,row,key) -> TAPi18n.__ (Areas.findOne(val).name)},
#       {
#         key: 'actions',
#         label: (() -> TAPi18n.__("actions")),
#         fn: (val,row,key) ->
#           Spacebars.SafeString (
#             '<i data-action="removeVolunteerCrew"
#                 data-id="'+ row._id + '" class="fa fa-trash"
#                 aria-hidden="true"></i>'
#           )
#       },
#     ]
#
# Template.volunteerBackend.events
#   'click [data-action="showAreaSlider"]': (event, template) ->
#     template.showAreaSlider.set(!template.showAreaSlider.get())
#
#   'click [data-action="removeVolunteerCrew"]': (event, template) ->
#     formId = $(event.target).data('id')
#     Meteor.call 'VolunteerBackend.removeCrewForm', formId
#
#   'click #VolunteerTableID.reactive-table tbody tr': (event, template) ->
#     data = VolunteerCrew.findOne(this._id)
#     if !data then data = {userId: this.userId}
#     template.currentResource.set {
#       form: VolunteerForm.findOne({userId: this.userId})
#       user: Meteor.users.findOne(this.userId)
#       data: {userId : this.userId}}
#
#   'click #VolunteerCrewTableID.reactive-table tbody tr': (event, template) ->
#     data = VolunteerCrew.findOne(this._id)
#     template.currentResource.set {
#       form: VolunteerForm.findOne({userId: this.userId})
#       user: Meteor.users.findOne(this.userId)
#       data: data}
#
# Template.volunteerBackendAreasSlider.helpers
#   'areas': () ->
#     Areas.find().map((area) ->
#       _id: area._id
#       name: area.name
#       hasLeads: getAreaLeads(area._id)
#       crews: VolunteerCrew.find({areaId: area._id}).count()
#       shifts: VolunteerShift.find({areaId: area._id}).count()
#     )
#
# Template.volunteersStats.helpers
#   'usersTotal': () -> Meteor.users.find().count()
#   'volunteersTotal': () ->
#     _.uniq(VolunteerShift.find().map((e) -> e._id)).length
#   'performersTotal': () ->
#     perf_sel = {status: {$in: ["accepted", "scheduled"]}}
#     _.uniq(PerformanceResource.find(perf_sel).map((e) -> e._id)).length
