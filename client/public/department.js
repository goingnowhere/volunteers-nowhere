import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'

Template.publicDepartmentView.onCreated(function onCreated() {
  const template = this
  const did = template.data._id
  template.dep = new ReactiveVar({})
  const depSub = template.subscribe(`${Volunteers.eventName}.Volunteers.department`, { _id: did })
  template.subscribe(`${Volunteers.eventName}.Signups.byDept`, did, 'shift')
  template.subscribe(`${Volunteers.eventName}.Signups.byDept`, did, 'project')
  template.subscribe(`${Volunteers.eventName}.Signups.byDept`, did, 'lead')
  template.autorun(() => {
    if (depSub.ready()) {
      const dep = Volunteers.Collections.department.findOne(did)
      template.dep.set(dep)
    }
  })
})

Template.publicDepartmentView.helpers({
  dep: () => Template.instance().dep.get(),
  teams: () => {
    const depId = Template.currentData()._id
    return Volunteers.Collections.team.find({ parentId: depId })
  },
})
