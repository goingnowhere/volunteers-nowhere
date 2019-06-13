import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import moment from 'moment-timezone'
import $ from 'jquery'

Template.weekstrip.onCreated(function onCreated() {
  const template = this
  template.day = new ReactiveVar()
  template.callback = () => {}
  template.autorun(() => {
    const { day, shownDay = day, callback } = Template.currentData()
    if (day) {
      template.day.set(moment(day))
    }
    if (shownDay && !template.weekManuallySet) {
      const sdClone = moment(shownDay)
      template.weekNumber = new ReactiveVar(sdClone.week())
      template.year = new ReactiveVar(sdClone.year())
    }
    if (callback) {
      template.callback = callback
    }
  })
})

const isCurrentDay = date => Template.instance().day.get() && Template.instance().day.get().isSame(date, 'day')

Template.weekstrip.helpers({
  week: () => {
    const { weekNumber, year } = Template.instance()
    if (weekNumber) {
      const start = moment()
        .week(weekNumber.get())
        .year(year.get())
        .weekday(0)
        .startOf('day')
      return [...Array(7).keys()].map(i => start.clone().add(i, 'days'))
    }
    return []
  },
  displayDay: date => date.format('ddd Do'),
  displayMonth: date => date.format('MMM'),
  isCurrentDay,
})

Template.weekstrip.events({
  'click [data-action="prev"]': (event, template) => {
    event.preventDefault()
    template.weekManuallySet = true
    template.weekNumber.set(template.weekNumber.get() - 1)
  },
  'click [data-action="select"]': (event, template) => {
    event.preventDefault()
    const dayOfWeek = $(event.currentTarget).data('day')
    const day = moment()
      .week(template.weekNumber.get())
      .year(template.year.get())
      .weekday(dayOfWeek)
      .startOf('day')
    if (isCurrentDay(day)) {
      template.callback()
      template.day.set()
    } else {
      template.callback(day.clone())
      template.day.set(day)
    }
  },
  'click [data-action="next"]': (event, template) => {
    event.preventDefault()
    template.weekManuallySet = true
    template.weekNumber.set(template.weekNumber.get() + 1)
  },
})
