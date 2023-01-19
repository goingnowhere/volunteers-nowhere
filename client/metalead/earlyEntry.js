import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import moment from 'moment-timezone'
import { ReactiveVar } from 'meteor/reactive-var'
import { Volunteers } from '../../both/init'
import { EventSettings } from '../../both/collections/settings'

Template.earlyEntry.onCreated(function onCreated() {
  const template = this
  template.departmentId = template.data._id
  template.buildPeriod = new ReactiveVar({})
  template.subscribe(`${Volunteers.eventName}.Volunteers.Signups.byDept`, template.departmentId, 'project')
  template.autorun(() => {
    if (template.subscribe('eventSettings').ready()) {
      const settings = EventSettings.findOne()
      template.buildPeriod.set(settings.buildPeriod)
    }
  })
})

// TODO fix
Template.earlyEntry.helpers({
  eeUsers: () => {
    const template = Template.instance()
    const parentId = template.departmentId
    const { start, end } = template.buildPeriod.get()
    if (start && end) {
      const teams = Volunteers.collections.team.find({ parentId }).fetch()
      const teamIds = _.pluck(teams, '_id')
      const sel = {
        // TODO Can we include shifts? We'd need to aggregate in shifts for start time
        type: 'project',
        start: {
          $gte: moment(start).startOf('day').toDate(),
          $lt: moment(end).endOf('day').toDate(),
        },
        parentId: { $in: teamIds },
        status: 'confirmed',
      }
      const projects = Volunteers.collections.signups.find(sel).fetch()
      return _.chain(projects).map((pr) => {
        const { profile, emails } = Meteor.users.findOne(pr.userId)
        const { name } = Volunteers.collections.team.findOne(pr.parentId)
        return {
          teamName: name,
          ticketNumber: profile.ticketNumber,
          arrivalDate: pr.start,
          userId: pr.userId,
          email: emails[0].address,
        }
      }).sortBy('arrivalDate').value()
    } return []
  },
})
