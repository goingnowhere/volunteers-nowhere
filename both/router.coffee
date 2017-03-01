# Router.configure
#   loadingTemplate: 'loading',
#   notFoundTemplate: 'notFound'

Router.route '/teams/view/:_id',
  name: 'teamsView'
  template: 'teamsView'
  waitOn: () -> [ Meteor.subscribe("teams") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Teams.findOne(this.params._id)

Router.route '/teams/add',
  name: 'teams'
  template: 'teams'

Router.route '/teams/edit/:_id',
  name: 'teamsEdit'
  template: 'teams'
  waitOn: () -> [ Meteor.subscribe("teams") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      Teams.findOne(this.params._id)

Router.route '/volunteer',
  name: 'volunteer'
  template: 'volunteer'
  waitOn: () -> [
    # Meteor.subscribe("FormBuilder.dynamicForms"),
    Meteor.subscribe("volunteerForm"),
   ]
  data: () ->
    if this.ready()
      VolunteerForm.findOne()#{userId: this.userId})
      # ff = FormBuilder.Collections.DynamicForms.findOne({name: "VolunteerForm"})
      # _.extend(f,{formId : ff._id})

Router.route '/admin/volunteer/forms',
  name: 'volunteerForm'
  template: 'adminVolunteerForm'
  waitOn: () -> [ Meteor.subscribe("FormBuilder.dynamicForms") ]
  data: () -> {}

Router.route '/admin/volunteer/forms/:_id',
  name: 'volunteerFormEdit'
  template: 'adminVolunteerForm'
  waitOn: () -> [ Meteor.subscribe("FormBuilder.dynamicForms") ]
  data: () ->
    if this.params && this.params._id && this.ready()
      FormBuilder.Collections.DynamicForms.findOne(this.params._id)
