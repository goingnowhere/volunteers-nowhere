import React from 'react'
import { LoggedInHeader } from './LoggedInHeader.jsx'
import { HomeHeader } from './HomeHeader.jsx'

export function Header({ user }) {
  return !user ? (
    <HomeHeader />
  ) : (
    <LoggedInHeader user={user} />
  )
}
