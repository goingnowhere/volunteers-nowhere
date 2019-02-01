
export const Pages = {}

Pages.NoInfoUserPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'noInfoUser',
  templateName: 'noInfoUserList',
  fastRender: true,
  perPage: 20,
  sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
  // filter only on users that filled in their form
  filters: { 'profile.formFilled': true },
  fields: {
    profile: 1, emails: 1, createdAt: 1, roles: 1, status: 1,
  },
  availableSettings: {
    filters: true,
    // settings: true
  },
})

Pages.ManagerUserPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'managerUser',
  templateName: 'managerUserList',
  fastRender: true,
  perPage: 20,
  sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
  fields: {
    profile: 1, emails: 1, createdAt: 1, roles: 1, status: 1,
  },
  availableSettings: {
    filters: true,
    // settings: true
  },
})

Pages.ShiftEnrollUserSearchPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'shiftEnrollTableRow',
  templateName: 'shiftEnrollUsersTable',
  fastRender: true,
  perPage: 10,
  // fields: {"profile": 1, "emails.0.address": 1, "createdAt": 1, "_id": 1},
  sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
  filters: { 'profile.formFilled': true },
  availableSettings: {
    filters: true,
  },
  table: {
    class: 'table',
    fields: ['profile', '_id', 'emails'],
    header: [],
  },
})

Pages.ProjectEnrollUserSearchPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'projectEnrollTableRow',
  templateName: 'projectEnrollUsersTable',
  fastRender: true,
  perPage: 10,
  // fields: {"profile": 1, "emails.0.address": 1, "createdAt": 1, "_id": 1},
  sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
  filters: { 'profile.formFilled': true },
  availableSettings: {
    filters: true,
  },
  table: {
    class: 'table',
    fields: ['profile', '_id', 'emails'],
    header: [],
  },
})

Pages.LeadEnrollUserSearchPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'leadEnrollTableRow',
  templateName: 'leadEnrollUsersTable',
  fastRender: true,
  perPage: 10,
  // fields: {"profile": 1, "emails.0.address": 1, "createdAt": 1, "_id": 1},
  sort: { 'status.online': -1, 'status.lastLogin': -1, createdAt: -1 },
  filters: { 'profile.formFilled': true },
  availableSettings: {
    filters: true,
  },
  table: {
    class: 'table',
    fields: ['profile', '_id', 'emails'],
    header: [],
  },
})
