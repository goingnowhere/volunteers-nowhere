import { Template } from 'meteor/templating'
// import { Volunteers } from '../both/init'

let template

Template.dashboard.onCreated(function onCreated() {
  template = this
  template.autorun(() => {
    template.sub = template.subscribe('test.Volunteers.allDuties.byUser')
  })
})

// Template.dashboard.onRendered(function onRendered() {
//   return this.autorun(() => {
//     $('#shiftCalendar').fullCalendar('refetchEvents')
//     $('#shiftCalendar').fullCalendar('refetchResources')
//
//     $('#taskCalendar').fullCalendar('refetchEvents')
//     return $('#taskCalendar').fullCalendar('refetchResources')
//   })
// })
//
// const signupCollections = (type) => {
//   if (type === 'shift') {
//     return Volunteers.ShiftSignups
//   } else if (type === 'task') {
//     return Volunteers.TaskSignups
//   }
//   return null
// }
// const resourcesA = (collection, type, filter = {}, limit = 0) =>
//   collection.find(filter, { limit }).forEach((job) => {
//     const team = Volunteers.Team.findOne(job.parentId)
//     let users = []
//     const signupsSub = template.subscribe('test.signups.byShift', job._id)
//     if (signupsSub.ready()) {
//       const signupCollection = signupCollections[type]
//       users = signupCollection.find({ shiftId: job._id, status: { $in: ['confirmed'] } })
//         .map(s => s.userId)
//       const signup = signupCollection.findOne({ shiftId: job._id, userId: Meteor.userId() })
//       const department = team.parentId && Volunteers.Department.findOne(team.parentId)
//       const division = department && department.parentId &&
//         Volunteers.Division.findOne(department.parentId)
//       const mod = {
//         teamId: team._id,
//         shiftId: job._id,
//         type,
//         teamName: team.name,
//         departmentName: department && department.name,
//         divisionName: division && division.name,
//         parentId: team.parentId,
//         title: job.title,
//         description: job.description,
//         status: signup ? signup.status : null,
//         canBail: (signup != null) && (signup.status !== 'bailed'),
//         policy: job.policy,
//         tags: team.tags,
//         users,
//       }
//       if (type === 'shift') {
//         _.extend(mod, {
//           start: job.start,
//           end: job.end,
//           startTime: job.startTime,
//           endTime: job.endTime,
//         })
//       }
//       if (type === 'task') {
//         _.extend(mod, {
//           dueDate: job.dueDate,
//           estimatedTime: job.estimatedTime,
//         })
//       }
//       return mod
//     }
//   })

Template.dashboard.helpers({
  userId: () => Meteor.userId(),
  optionsShifts: () => ({
    id: 'shiftCalendar',
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
    // editable: true,
    // droppable: true,
    scrollTime: '06:00',
    // slotDuration: '00:15',
    // defaultTimedEventDuration: '02:00',
    // forceEventDuration: true,
    aspectRatio: 1.5,
    defaultView: 'agendaWeek',
    // resourceAreaWidth: '20%',
    // resources: callback => callback([]),
    events: [],
    // resources: (callback) => {
    //   const resources = resourcesA(Volunteers.Shifts, 'shifts').map(shift => ({
    //     id: shift._id,
    //     title: shift.teamName,
    //     resourceId: shift._id,
    //   }))
    //   return callback(resources)
    // },
  }),
})
