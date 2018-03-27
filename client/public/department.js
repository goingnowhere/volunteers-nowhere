import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from '../../both/init'

Template.publicDepartmentView.onCreated(function onCreated() {
  const template = this
  const did = template.data._id
  template.subscribe(`${Volunteers.eventName}.ShiftSignups.byDepartment`, did)
  template.subscribe(`${Volunteers.eventName}.ProjectSignups.byDepartment`, did)
  template.subscribe(`${Volunteers.eventName}.LeadSignups.byDepartment`, did)
})

Template.publicDepartmentView.helpers({
  teams: () => {
    const department = Template.currentData()
    return Volunteers.Collections.Team.find({ parentId: department._id })
  },
})
