@Schemas = {}

@VolunteerForm = new Mongo.Collection('volunteerForm')

# if (Meteor.isClient)
#   console.log "re-run on client"
#   sc = FormBuilder.attachFormBuilderSchema(
#     Volunteers.Schemas.VolunteerForm,"VolunteerForm")
#   VolunteerForm.attachSchema(sc)
#   # complete the Volunteers Form with additional fields.
#   Volunteers.setVolunteerForm(VolunteerForm)
# else

# rerun both on client and server thanks to peerlibrary:server-autorun
Tracker.autorun () ->
  sc = FormBuilder.attachFormBuilderSchema(
    Volunteers.Schemas.VolunteerForm,"VolunteerForm")
  VolunteerForm.attachSchema(sc)
  # complete the Volunteers Form with additional fields.
  Volunteers.setVolunteerForm(VolunteerForm)
