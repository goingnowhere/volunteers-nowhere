import { Template } from 'meteor/templating'
import { moment } from 'meteor/momentjs:moment'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'
import { EventSettings } from '../../both/settings'

moment.tz.setDefault('Europe/Paris')

Template.earlyEntry.onCreated(function onCreated() {
  const template = this
  template.departmentId = template.data._id
  template.buildPeriod = new ReactiveVar({})
  template.subscribe(`${Volunteers.eventName}.Volunteers.ProjectSignups.byDepartment`, template.departmentId)
  template.autorun(() => {
    if (template.subscribe('eventSettings').ready()) {
      const settings = EventSettings.findOne()
      template.buildPeriod.set(settings.buildPeriod)
    }
  })
})

Template.earlyEntry.helpers({
  eeUsers: () => {
    const template = Template.instance()
    const parentId = template.departmentId
    const { start, end } = template.buildPeriod.get()
    if (start && end) {
      const teams = Volunteers.Collections.Team.find({ parentId }).fetch()
      const teamIds = _.pluck(teams, '_id')
      const sel = {
        start: {
          $gte: moment(start).startOf('day').toDate(),
          $lt: moment(end).endOf('day').toDate(),
        },
        parentId: { $in: teamIds },
        status: 'confirmed',
      }
      const projects = Volunteers.Collections.ProjectSignups.find(sel).fetch()
      return _.chain(projects).map((pr) => {
        const { profile } = Meteor.users.findOne(pr.userId)
        const { name } = Volunteers.Collections.Team.findOne(pr.parentId)
        return {
          teamName: name,
          ticketNumber: profile.ticketNumber,
          arrivalDate: pr.start,
          userId: pr.userId,
        }
      }).sortBy('arrivalDate').value()
    } return []
  },
})
