import 'bootstrap'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.css'
import { Router } from 'meteor/iron:router'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Volunteers } from '../../both/init'

Template.userDashboard.helpers({
  userId: () => Meteor.userId(),
  bookedMissions: () => {
    const sel = { status: { $in: ['confirmed', 'pending'] } }
    return (
      (Volunteers.Collections.ShiftSignups.find(sel).count() > 0) ||
      (Volunteers.Collections.ProjectSignups.find(sel).count() > 0) ||
      (Volunteers.Collections.TaskSignups.find(sel).count() > 0)
    )
  },
})

Template.userDashboard.events({
  'click [data-action="edit_form"]': () => {
    Router.go('volunteerForm')
  },
})

Template.userResponsibilities.onCreated(function OnCreated() {
  const template = this
  if ((template.data) && (template.data.userId)) {
    template.userId = template.data.userId
  } else {
    template.userId = Meteor.userId()
  }
})

Template.userResponsibilities.helpers({
  leads: () => {
    const { userId } = Template.instance()
    const sl = Volunteers.Collections.LeadSignups.find({ userId, status: 'confirmed' }).fetch()
    const l = sl.reduce((acc, s) => {
      const t = Volunteers.Collections.Team.findOne(s.parentId)
      if (t) { acc.push(t) }
      return acc
    }, [])
    return l
  },
  metaleads: () => {
    const { userId } = Template.instance()
    const sl = Volunteers.Collections.LeadSignups.find({ userId }).fetch()
    const l = sl.reduce((acc, s) => {
      const t = Volunteers.Collections.Department.findOne(s.parentId)
      if (t) { acc.push(t) }
      return acc
    }, [])
    return l
  },
  isManager: () => {
    const { userId } = Template.instance()
    Volunteers.isManager(userId)
  },
  isNoInfo: () => {
    const { userId } = Template.instance()
    const noInfo = Volunteers.Collections.Team.findOne({ name: 'NoInfo' })
    return (noInfo != null) && Volunteers.isManagerOrLead(userId, [noInfo._id])
  },
})

const setSelectListener = (template, selector, filterVar) => {
  // Need to add this event listener this way as adding through Blaze doesn't work - Rich
  template.$(selector).on('changed.bs.select', (event) => {
    // Seriously? There must be a better way. Docs claim we get an arg but we don't - Rich
    const val = Array.from(event.currentTarget.selectedOptions).map(option => option.value)
    filterVar.set(val.length > 0 ? val : null)
  })
  // Possibly only needed in development when reloading
  template.$(selector).selectpicker('refresh')
}

Template.filteredSignupsList.onCreated(function onCreated() {
  const template = this
  template.teamLimit = 4
  template.subscribe(`${Volunteers.eventName}.Volunteers.team`)
  template.type = new ReactiveVar('event')
  template.filters = {
    skills: new ReactiveVar(),
    quirks: new ReactiveVar(),
    priorities: new ReactiveVar(),
  }
})
Template.filteredSignupsList.onRendered(function onRendered() {
  const template = this
  setSelectListener(template, '#skillSelect', template.filters.skills)
  setSelectListener(template, '#quirkSelect', template.filters.quirks)
  setSelectListener(template, '#prioritySelect', template.filters.priorities)

  template.$('#typeSelect').on('changed.bs.select', (event) => {
    template.type.set(event.currentTarget.value)
  })
  template.$('#typeSelect').selectpicker('refresh')
})

Template.filteredSignupsList.helpers({
  // Not sure why we're deliberately including null values in these lists - Rich
  skills: () => Volunteers.getSkillsList().filter(skill => skill.value),
  quirks: () => Volunteers.getQuirksList().filter(quirk => quirk.value),
  signupsListProps: () => {
    const type = Template.instance().type.get()
    const { quirks, skills } =
      Volunteers.Collections.VolunteerForm.findOne({ userId: Meteor.userId() })
    return {
      dutyType: type,
      filters: {
        skills: Template.instance().filters.skills.get(),
        quirks: Template.instance().filters.quirks.get(),
        priorities: Template.instance().filters.priorities.get(),
      },
      quirks,
      skills,
    }
  },
})

AutoForm.addHooks([
  'InsertUsersFormId',
  'UpdateUsersFormId',
  'InsertVolunteerFormFormId',
  'UpdateVolunteerFormFormId'], {
  onSuccess() {
    Router.go('/dashboard')
  },
})
