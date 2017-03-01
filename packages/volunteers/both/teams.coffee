share.Schemas = {}

share.Shifts = new Mongo.Collection 'Volunteers.shifts'

share.Schemas.Shifts = new SimpleSchema(
  teamId:
    type: String
  shiftId:
    type: String
  usersId:
    type: [String]
)

share.Shifts.attachSchema(share.Schemas.Shifts)

share.Tasks = new Mongo.Collection 'Volunteers.tasks'

share.Schemas.Tasks = new SimpleSchema(
  teamId:
    type: String
  taskId:
    type: String
  usersId:
    type: [String]
)

share.Tasks.attachSchema(share.Schemas.Tasks)

TeamTask = new SimpleSchema(
  _id:
    type: String
    optional: true
    autoValue: () ->
      if this.isInsert then return Random.id()
      else this.unset()
    autoform:
      type: "hidden"
  title:
    type: String
    label: () -> TAPi18n.__("title")
    optional: true
  description:
    type: String
    label: () -> TAPi18n.__("description")
    optional: true
    autoform:
      rows: 5
  dueDate:
    type: Date
    label: () -> TAPi18n.__("due_date")
    optional: true
    autoform:
      afFieldInput:
        type: "datetimepicker"
        placeholder: () -> TAPi18n.__("due_date")
        opts: () ->
          step: 60
          format: 'DD-MM-YYYY HH:mm'
          defaultTime:'10:00'
  min:
    type: Number
    label: () -> TAPi18n.__("min_members")
    optional: true
    autoform:
      afFieldInput:
        placeholder: "min"
  max:
    type: Number
    label: () -> TAPi18n.__("min_members")
    optional: true
    autoform:
      afFieldInput:
        placeholder: "max"
)

TeamShift = new SimpleSchema(
  _id:
    type: String
    optional: true
    autoValue: () ->
      if this.isInsert then return Random.id()
      else this.unset()
    autoform:
      type: "hidden"
  title:
    type: String
    label: () -> TAPi18n.__("title")
    optional: true
  start:
    type: String
    label: () -> TAPi18n.__("start")
    autoform:
      afFieldInput:
        type: "datetimepicker"
        placeholder: () -> TAPi18n.__("start")
        opts: () ->
          step: 15
          format: 'DD-MM-YYYY HH:mm'
          defaultTime:'05:00'
  end:
    type: String
    label: () -> TAPi18n.__("end")
    autoform:
      afFieldInput:
        validation: "none"
        type: "datetimepicker"
        placeholder: () -> TAPi18n.__("end")
        opts: () ->
          step: 15
          format: 'DD-MM-YYYY HH:mm'
          defaultTime:'08:00'
  min:
    type: Number
    label: () -> TAPi18n.__("min_members")
    optional: true
    defaultValue: 1
    autoform:
      afFieldInput:
        placeholder: "min"
  max:
    type: Number
    label: () -> TAPi18n.__("min_members")
    optional: true
    autoform:
      afFieldInput:
        placeholder: "max"
  description:
    type: String
    label: () -> TAPi18n.__("description")
    optional: true
    autoform:
      rows: 5
)

share.Teams = new Mongo.Collection 'teams'
roleOptions = ["lead","co-lead"]

Leads = new SimpleSchema(
  userId:
    type: String
    label: () -> TAPi18n.__("name")
    autoform:
      type: "select2"
      options: () ->
        Meteor.users.find().map((e) ->
          {value: e._id, label: e.emails[0].address })
  role:
    type: String
    label: () -> TAPi18n.__("role")
    autoform:
      options: () -> _.map(roleOptions, (e) -> {value: e, label: TAPi18n.__(e)})
      defaultValue: "lead"
)

getTagList = () ->
  tags = _.union.apply null, share.Teams.find().map((team) -> team.tags)
  _.map tags, (tag) -> {value: tag, label: tag}

share.Schemas.Teams = new SimpleSchema(
  name:
    type: String
    label: () -> TAPi18n.__("teamname")
  leads:
    type: [Leads]
    label: () -> TAPi18n.__("leads")
    optional: true
  tags:
    type: [String]
    label: () -> TAPi18n.__("tags")
    optional: true
    autoform:
      type: "select2"
      options: getTagList
      afFieldInput:
        multiple: true
        select2Options: () -> {tags: true}
  description:
    type: String
    label: () -> TAPi18n.__("description")
    optional: true
    autoform:
      rows: 5
  shifts:
    type: [TeamShift]
    label: () -> TAPi18n.__("Shifts")
    optional: true
  tasks:
    type: [TeamTask]
    label: () -> TAPi18n.__("Tasks")
    optional: true
  parents:
    type: [String]
    optional: true #???
    autoform:
      omit: true
)

share.Teams.attachSchema(share.Schemas.Teams)

toIsoDate = (doc) ->
  if doc.shifts && doc.shifts.length > 0
    for shift,i in doc.shifts
      doc.shifts[i].start = moment(shift.start,"DD-MM-YYYY HH:mm").toDate()
      doc.shifts[i].end = moment(shift.end,"DD-MM-YYYY HH:mm").toDate()
  if doc.tasks && doc.tasks.length > 0
    for task,i in doc.tasks
      doc.tasks[i].dueDate = moment(task.dueDate,"DD-MM-YYYY HH:mm").toDate()

share.Teams.before.insert (userId, doc) -> toIsoDate(doc)
share.Teams.before.update (userId, doc, fieldNames, modifier, options) ->
  toIsoDate(modifier["$set"])
