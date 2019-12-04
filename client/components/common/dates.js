import moment from 'moment-timezone'

export const formatDateTime = date => moment(date).format('MMM Do, HH:mm')
export const formatDate = date => moment(date).format('MMM Do (ddd)')
export const formatTime = date => moment(date).format('HH:mm')
export const differenceTime = (start, end) => `(+${moment(end).diff(start, 'days') + 1})`
export const longformDay = date => moment(date).format('dddd')

export const isSameDay = (start, end) => moment(start).isSame(moment(end), 'day')
