export default {
  division: [
    {
      name: 'SLaP',
    },
    {
      name: 'Volunteers'
    },
    {
      name: 'BDSM'
    },
  ],
  department: [
    {
      name: 'Power',
      parent: 'SLaP',
    },
    {
      name: 'Build',
      parent: 'BDSM',
    },
    {
      name: 'DVS',
      parent: 'Volunteers',
    },
  ],
  team: [
    {
      name: 'Werkhaus Build',
      parent: 'Build',
    },
    {
      name: 'MoN Build',
      parent: 'Build',
    }
  ],

}
