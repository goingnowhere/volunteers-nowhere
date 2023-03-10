import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'

export const HomeHeader = withRouter(() => (
  <nav className="navbar navbar-expand-lg bg-primary sticky-top text-uppercase" id="mainNav">
    <a className="navbar-brand" href="/">
      <img src="/img/compass.svg" width="48" height="48" alt="" />
    </a>
    <button
      className="navbar-toggler navbar-toggler-right text-uppercase text-white rounded"
      type="button"
      data-toggle="collapse"
      data-target="#navbarResponsive"
      aria-controls="navbarResponsive"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      Menu<i className="fa fa-bars" />
    </button>
    <div className="collapse navbar-collapse" id="navbarResponsive">
      <ul className="navbar-nav">
        <li className="nav-item mx-0 mx-lg-1">
          <NavLink className="nav-link py-3 px-0 px-lg-3" to="/login">
            <i className="fa fa-download mr-2" />Login Now
          </NavLink>
        </li>
        <li className="nav-item mx-0 mx-lg-1">
          <a className="nav-link py-3 px-0 px-lg-3 rounded" href="/#about">
            About
          </a>
        </li>
      </ul>
    </div>
  </nav>
))
