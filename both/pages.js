
export const Pages = {}

const NoInfoUserPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'noInfoUser',
  templateName: 'noInfoUserList',
  fastRender: true,
  perPage: 20,
  sort: { createdAt: -1 },
  // filter only on users that agreed with the TOS
  filters: { terms: true },
  fields: {
    profile: 1, emails: 1, createdAt: 1, roles: 1, status: 1,
  },
  availableSettings: {
    filters: true,
    // settings: true
  },
})
Pages.NoInfoUserPages = NoInfoUserPages

export const EnrollUserSearchPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: 'allUsersTableRow',
  templateName: 'allUsersTable',
  fastRender: true,
  perPage: 20,
  // fields: {"profile": 1, "emails.0.address": 1, "createdAt": 1, "_id": 1},
  sort: { createdAt: -1 },
  filters: { terms: true },
  availableSettings: {
    filters: true,
  },
  table: {
    class: 'table',
    fields: ['profile', '_id', 'emails'],
    header: [],
    //    header: _.map IngredientFields, (f) -> f[0].toUpperCase() + f.slice 1
  },
})

Pages.EnrollUserSearchPages = EnrollUserSearchPages
