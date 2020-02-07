import { Template } from 'meteor/templating'

import { EnrollUserList } from '../components/lead/search/EnrollUserList.jsx'

Template.shiftEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
Template.projectEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
Template.leadEnrollUsersTable.helpers({
  EnrollUserList: () => EnrollUserList,
  data: () => Template.currentData().data,
})
