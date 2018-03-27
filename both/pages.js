export const UserPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: "noInfoUser",
  templateName: "noInfoUserList",
  // fastRender: true,
  perPage: 20,
  sort: {createdAt: -1},
  availableSettings: {
    filters: true,
    // settings: true
  }
})

export const UserSearchPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: "allUsersTableRow",
  templateName: "allUsersTable",
  // fastRender: true,
  perPage: 20,
  sort: {createdAt: -1},
  availableSettings: {
    filters: true,
    // settings: true
  },
  table: {
    class: "table",
    fields: ["profile","_id","emails.0.address"],
    header: []
//    header: _.map IngredientFields, (f) -> f[0].toUpperCase() + f.slice 1
  }
})
