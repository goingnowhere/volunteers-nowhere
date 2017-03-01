
share.form = new ReactiveVar(share.VolunteerForm)

Volunteers = () ->
  Collections:
    VolunteerForm: share.VolunteerForm
    Teams: share.Teams
  Schemas: share.Schemas
  setVolunteerForm: (newform) -> share.form.set(newform)
  getVolunteerForm: () -> share.form.get()

Volunteers = new Volunteers()
