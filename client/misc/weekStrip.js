import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { moment } from 'meteor/momentjs:moment'
import $ from 'jquery'

Template.weekstrip.onCreated(function onCreated() {
  const template = this
  template.day = new ReactiveVar(moment())
  template.callback = () => {}
  if (template.data) {
    if (template.data.day) {
      template.day.set(moment(template.data.date))
    }
    if (template.data.callback) {
      template.callback = template.data.callback
    }
  }
  template.weekNumber = new ReactiveVar(template.day.get().week())
})

Template.weekstrip.helpers({
  week: () => {
    const start = moment().week(Template.instance().weekNumber.get()).weekday(0).startOf('day')
    return [...Array(7).keys()].map(i => start.clone().add(i, 'days'))
  },
  displayDay: date => date.format('ddd Do'),
  displayMonth: date => date.format('MMM'),
  isoDate: date => date.toISOString(),
  isCurrentDay: date => Template.instance().day.get().isSame(date, 'day'),
})

Template.weekstrip.events({
  'click [data-action="prev"]': (event, template) => {
    event.preventDefault()
    template.weekNumber.set(template.weekNumber.get() - 1)
  },
  'click [data-action="select"]': (event, template) => {
    event.preventDefault()
    const dayOfWeek = $(event.currentTarget).data('day')
    const day = moment().week(template.weekNumber.get()).weekday(dayOfWeek).startOf('day')
    template.callback(day.clone())
    template.day.set(day)
  },
  'click [data-action="next"]': (event, template) => {
    event.preventDefault()
    template.weekNumber.set(template.weekNumber.get() + 1)
  },
})
