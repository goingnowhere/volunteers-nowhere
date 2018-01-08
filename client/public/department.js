import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from '../../both/init'

Template.publicDepartmentView.onCreated(function onCreated() {
  const template = this
  this.departmentId = template.data._id
  // XXX this should just fetch the teams of this dept
  template.subscribe(`${Volunteers.eventName}.Volunteers.organization`)
})

Template.publicDepartmentView.helpers({
  teams: () => {
    const template = Template.instance()
    return Volunteers.Collections.Team.find({ parentId: template.departmentId })
  },
  canEditTeam: () => {
    const template = Template.instance()
    return Volunteers.isManagerOrLead(Meteor.userId(), [template.departmentId])
  },
})
