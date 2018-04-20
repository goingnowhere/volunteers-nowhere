const form = [
  {
    type: 'text',
    required: true,
    label: 'Name / PlayaName',
    className: 'form-control',
    name: 'text-1511694619820',
    group: '1 - About You',
    groupHelp: 'A few basic information about you.',
  },
  {
    type: 'textarea',
    label: 'Bio',
    className: 'form-control',
    name: 'textarea-1511695651949',
    rows: '5',
    group: '1 - About You',
  },
  {
    type: 'textarea',
    label: 'Do you have experience as volunteer at any burns?',
    className: 'form-control',
    name: 'textarea-1523175003065',
    rows: '3',
    group: '1 - About You',
  },
  {
    type: 'radio-group',
    label: 'Gender',
    description: 'This info is only used for particular shifts where a gender balance is desirable.',
    inline: true,
    name: 'radio-group-1523175199854',
    group: '1 - About You',
    values: [
      {
        label: 'Male',
        value: 'male',
      },
      {
        label: 'Female',
        value: 'female',
      },
      {
        label: 'In Between',
        value: 'between',
      },
    ],
  },
  {
    type: 'checkbox-group',
    label: 'Food preference for if we feed you on shifts',
    description: 'The local producer we use for meat is not certified halal and our kitchen is not kosher.',
    name: 'checkbox-group-1516823589180',
    group: '3 - Food',
    values: [
      {
        label: 'Omnivore',
        value: 'omnivore',
        selected: true,
      },
      {
        label: 'Vegetarian',
        value: 'vegetarian',
      },
      {
        label: 'Vegan',
        value: 'vegan',
      },
      {
        label: 'Fishetarian ( no meat, but fish ok)',
        value: 'fish',
      },
    ],
  },
  {
    type: 'checkbox-group',
    label: 'Grave Allergies',
    description: 'If you eat these  we have to take you to the hospital.',
    inline: true,
    name: 'checkbox-group-1516817336171',
    group: '3 - Food',
    groupHelp: 'During the festival we feed volunteers helping with shifts of for more then 6hs. We need to ask you a few questions to make this happen.',
    values: [
      {
        label: 'Gluten/Celiac',
        value: 'celiac',
      },
      {
        label: 'Fish/Shellfish',
        value: 'shellfish',
      },
      {
        label: 'Peanuts/Nuts',
        value: 'nuts',
      },
      {
        label: 'Tree nuts',
        value: 'treenuts',
      },
      {
        label: 'Soy',
        value: 'soy',
      },
      {
        label: 'Egg',
        value: 'egg',
      },
    ],
  },
  {
    type: 'checkbox-group',
    label: 'Food Intolerance&nbsp;',
    description: 'You are not going to die if you come in contacts with traces of these common allergens. There might be contamination. Please be flexible and come talk to us for very special requirements.',
    inline: true,
    name: 'checkbox-group-1523174426198',
    group: '3 - Food',
    values: [
      {
        label: 'Intolerance to gluten ',
        value: 'gluten',
      },
      {
        label: 'Peppers',
        value: 'peppers',
      },
      {
        label: 'Fish/shellfish',
        value: 'shellfish',
      },
      {
        label: 'Peanuts/Nuts',
        value: 'nuts',
      },
      {
        label: 'Egg',
        value: 'egg',
      },
      {
        label: 'Milk/Lactose',
        value: 'lactose',
      },
      {
        label: 'Other',
        value: 'other',
      },
    ],
  },
  {
    type: 'textarea',
    label: 'Any medical conditions you think we should be aware of ?',
    description: 'This information is confidential and will be used only in case of emergency.',
    className: 'form-control',
    name: 'textarea-1516823680441',
    group: '2 - Safety',
  },
  {
    type: 'checkbox-group',
    label: 'Which languages do you speak ?',
    inline: true,
    name: 'checkbox-group-1516823735515',
    group: '1 - About You',
    values: [
      {
        label: 'English',
        value: 'english',
        selected: true,
      },
      {
        label: 'French',
        value: 'french',
      },
      {
        label: 'Spanish',
        value: 'spanish',
      },
      {
        label: 'German',
        value: 'german',
      },
      {
        label: 'Italian',
        value: 'italian',
      },
      {
        label: 'Other',
        value: 'other',
      },
    ],
  },
  {
    type: 'text',
    required: true,
    label: 'Emergency contact information',
    description: 'Name  contact number  languages spoken, relationship to you',
    className: 'form-control',
    name: 'text-1516823884058',
    group: '2 - Safety',
  },
  {
    type: 'textarea',
    label: 'Anything Else ?',
    description: 'Anything relevant you might want to tell us.',
    className: 'form-control',
    name: 'textarea-1516823974420',
    rows: 3,
    group: 'Last One',
  },
  {
    type: 'checkbox-group',
    required: true,
    label: 'GDPR Disclaimer',
    name: 'checkbox-group-1523997171648',
    group: 'Last One',
    values: [
      {
        label: 'I consent to my data being stored for a period of up to 18 months, and for it to be used to facilitate the scheduling and safety of volunteers behalf of Nowhere (Europe) Ltd. I understand that you will delete my data within one month of my giving formal written notice to request you to do so.',
        value: 'gdpryes',
      },
    ],
  },
]


export const createForm = (Volunteers) => {
  console.log('Initializing User Form')
  Volunteers.setUserForm(form)
}
