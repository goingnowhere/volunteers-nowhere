
Template.weekstrip.onCreated(function onCreated() {
  const template = this
  template.day = new ReactiveVar(moment())
  template.callback = (day) => { console.log(day); }
  if (template.data) {
    if (template.data.day) {
      template.day.set(moment(template.data.date))
    }
    if (template.data.callback) {
      template.callback = template.data.callback
    }
  }
});

Template.weekstrip.helpers({
  'weeknumberPrev': () => { return (Template.instance().day.get().week() - 1) },
  'weeknumberNext': () => { return (Template.instance().day.get().week() + 1) },
  'week': () => {
    weeknumber = Template.instance().day.get().week();
    start = moment().day("Monday").week(weeknumber)
    l = [...Array(9).keys()].map((i) => { return start.clone().add(i-2,'days'); });
    return l
  },
  'displayDay': (date) => { return date.format("ddd Do") },
  'displayMonth': (date) => { return date.format("MMM") },
  'isoDate': (date) => { return date.toISOString() }
})

Template.weekstrip.events({
  'click [data-action="prev"]': (event, template) => {
    event.preventDefault();
    const day = $(event.target).data('week');
    console.log(day);
    template.day.set(moment(day))
  },
  'click [data-action="select"]': (event, template) => {
    event.preventDefault();
    const day = $(event.target).data('day');
    template.callback(moment(day))
  },
  'click [data-action="next"]': (event, template) => {
    event.preventDefault();
    const day = $(event.target).data('week')
    template.day.set(moment(day))
  },
})
