import moment from 'moment-timezone'

export const formatDateTime = date => {
  const toDisplay = moment(date)
  const format = toDisplay.isSame(new Date(), 'year') ? 'MMM Do, HH:mm' : 'MMM Do YYYY, HH:mm'
  return toDisplay.format(format)
}
export const formatDate = date => {
  const toDisplay = moment(date)
  const format = toDisplay.isSame(new Date(), 'year') ? 'MMM Do (ddd)' : 'MMM Do YYYY'
  return toDisplay.format(format)
}
export const formatTime = date => moment(date).format('HH:mm')
export const differenceTime = (start, end) => `(+${moment(end).diff(start, 'days') + 1})`
export const longformDay = date => moment(date).format('dddd')

export const isSameDay = (start, end) => moment(start).isSame(moment(end), 'day')
