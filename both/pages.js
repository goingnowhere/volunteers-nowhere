const UserPages = new Meteor.Pagination(Meteor.users, {
  itemTemplate: "noInfoUser",
  templateName: "noInfoUserList",
  fastRender: true,
  perPage: 20,
  sort: {createdAt: -1},
  availableSettings: { filters: true }
})
