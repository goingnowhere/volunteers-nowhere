import { Meteor } from 'meteor/meteor'
import React, { Fragment, useState, useEffect } from 'react'
import { _ } from 'meteor/underscore'
import { t } from '../../common/i18n'
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
  }, [text, ticketNumber, setSearch])
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

export const UserSearchList = ({
  component,
  Controls,
  showUser,
  getManagerDetails,
}) => {
  const [users, setList] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [search, setSearch] = useState({})
  const [page, changePage] = useState(1)
  const method = getManagerDetails ? 'users.paged.manager' : 'users.paged'
  useEffect(() => Meteor.call(method, { search, page, perPage: PER_PAGE }, (err, res) => {
    if (err) {
      console.error(err)
    } else {
      setList(res.users.map((user) => ({
        ...user,
        fistRoles: res.extras?.[user._id].roles,
      })))
      setUserCount(res.count)
    }
  }), [search, page, getManagerDetails, method])
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
