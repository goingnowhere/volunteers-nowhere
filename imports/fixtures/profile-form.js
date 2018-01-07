const form = [
  {
    type: 'text',
    label: 'Name',
    className: 'form-control',
    name: 'text-1511694619820',
    subtype: 'text',
  },
  {
    type: 'textarea',
    label: 'Bio',
    className: 'form-control',
    name: 'textarea-1511695651949',
    subtype: 'textarea',
  },
]

export const createForm = (Volunteers) => {
  console.log('Initializing User Form')
  Volunteers.setUserForm(form)
}
