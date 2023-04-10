import React from 'react'
import { NavLink } from 'react-router-dom'

export function HomeHeader() {
  return (
    <nav className="navbar bg-primary sticky-top text-uppercase px-1">
      <NavLink className="navbar-brand" to="/">
        <img src="/img/compass.svg" width="48" height="48" alt="" />
      </NavLink>
      <ul className="navbar-nav flex-row-reverse">
        <li>
          <NavLink className="btn" to="/login">
            <i className="fa fa-download mr-2" />Login Now
          </NavLink>
        </li>
        <li>
          <a className="btn" href="/#about">
            About
          </a>
        </li>
      </ul>
    </nav>
  )
}
