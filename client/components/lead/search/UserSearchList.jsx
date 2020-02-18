import { Meteor } from 'meteor/meteor'
import React, { Fragment, useState, useEffect } from 'react'
import { _ } from 'meteor/underscore'
import { Roles } from 'meteor/piemonkey:roles'
import { t } from '../../common/i18n'
import { Volunteers } from '../../../../both/init'
import { PagesPicker } from './PagesPicker.jsx'

const PER_PAGE = 10

const debouncedSearch = _.debounce((setSearch, text, ticketNumber) => {
  let search = []
  if (text) {
    search = ['profile.nickname', 'profile.firstName', 'profile.lastName', 'emails.0.address']
      .map((field) => ({ [field]: { $regex: text, $options: 'ix' } }))
  }
  // Should we only search when it could be a valid ticket number? e.g. by length
  if (ticketNumber) {
    search = [...search, { ticketId: ticketNumber }]
  }
  if (search.length > 0) {
    setSearch({ $or: search })
  } else {
    setSearch({})
  }
}, 1000)

const SearchBox = ({ setSearch }) => {
  const [text, setText] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  useEffect(() => {
    debouncedSearch(setSearch, text, ticketNumber)
  }, [text, ticketNumber])
  return (
    <div className="row">
      <div className="col-sm-6">
        <div className="form-group">
          <input
            type="text"
            name="text"
            id="users"
            className="form-control"
            placeholder={t('name_or_email')}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
      </div>
      <div className="col-sm-4">
        <div className="form-group">
          <input
            type="number"
            name="ticketNumber"
            id="ticketNumber"
            className="form-control"
            placeholder={t('ticket_number_search')}
            value={ticketNumber}
            onChange={(event) => setTicketNumber(parseInt(event.target.value, 10))}
          />
        </div>
      </div>
    </div>
  )
}

const UserSearchListComponent = ({
  ResultItem,
  users,
  userCount,
  Controls,
  setSearch,
  page,
  changePage,
  showUser,
}) => (
  <Fragment>
    <SearchBox setSearch={setSearch} />
    {users.map((user) =>
      <ResultItem key={user._id} user={user} Controls={Controls} showUser={showUser} />)}
    <PagesPicker totalPages={Math.ceil(userCount / PER_PAGE)} page={page} changePage={changePage} />
  </Fragment>
)

export const UserSearchList = ({ component, Controls, showUser }) => {
  const [users, setList] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [search, setSearch] = useState({})
  const [page, changePage] = useState(1)
  useEffect(() => Meteor.call('users.paged', { search, page, perPage: PER_PAGE }, (err, { users: res, count }) => {
    if (err) {
      console.error(err)
    } else {
      setList(res.map((user) => ({
        ...user,
        fistRoles: Roles.getRolesForUser(user._id, Volunteers.eventName).filter((role) => ['admin', 'manager'].includes(role)),
      })))
      setUserCount(count)
    }
  }), [search, page])
  return (
    <UserSearchListComponent
      ResultItem={component}
      users={users}
      userCount={userCount}
      Controls={Controls}
      setSearch={setSearch}
      page={page}
      changePage={changePage}
      showUser={showUser}
    />
  )
}
