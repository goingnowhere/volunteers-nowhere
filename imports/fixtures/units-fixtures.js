import { Roles } from 'meteor/alanning:roles'

const units = {
  divisions: [
    {
      name: 'NOrg',
      description: '',
      policy: 'public',
      parentId: 'TopEntity',
    },
  ],
  departments: [
    {
      name: 'SLAP',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'Volunteers',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'BDSM',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'Participants Wellness',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'Production',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'City Planning',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'Creativity',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'GG&P',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
    {
      name: 'Malfare',
      description: '',
      policy: 'public',
      parent: 'NOrg',
    },
  ],
  teams: [
    {
      name: 'Demarcation Team',
      parent: 'City Planning',
      description: 'Our team is responsible for the placement of all things! From the first flags\nto the signs with street names and all other things that need to be in a\nspecific place. We need you to be on site with the First Crew (around the 11 or\n12 of June), we\u2019ll give you a map and a \u0336f\u0336a\u0336n\u0336c\u0336y\u0336 functional GPS, teaming with our\nMap Fixer to make the city rise from the dust\u2026.sometimes in creative ways\u2026..\nNote: during Set-up we work all day, with a nice deserved siesta after lunch,\nit\u2019s not a shift system like during event time.\n',
    },
    {
      name: 'NoInfo',
      parent: 'Volunteers',
      description: 'Do you like helping people? Do you like knowing all the gossip? Are you\nwelcoming? Do you like to answer rhetorical questions? Come volunteer at the\nNoInfo Hub! We have \u0336a\u0336l\u0336l\u0336 \u0336o\u0336f\u0336 \u0336t\u0336h\u0336e\u0336 \u0336w\u0336r\u0336o\u0336n\u0336g\u0336 \u0336a\u0336n\u0336s\u0336w\u0336e\u0336r\u0336s\u0336 some correct information on what\nhappens when and where; we also help putting together people eager to volunteer\nwith teams needing their help, while lounging in a nice shade...just on the\nside of the Ice Ice Baby team\u2026.just saying\u2026. Join us and achieve stardom and\nwisdom!!! If you have any questions contact noinfo@goingnowhere.org. We work\nevent time on four hours sifts and require you to take up a minimum of two\nshifts.\n',
      quirks: ['work in the shade'],
    },
    {
      name: 'DVS',
      parent: 'Volunteers',
      description: "The Department of Volunteer Servicing keeps our set-up and strike crews healthy\nand (mostly) sane by distributing all the salty snacks and water they need make\nNowhere ready to happen. If you're available before or after event time and\ndon't mind seeing everything before it's ready then join in here.\nNote: during Set-up and strike we work all day, with a nice deserved siesta\nafter lunch, it\u2019s not a shift system like during event time.\n",
    },
    {
      name: 'Kunsthaus',
      parent: 'Creativity',
      description: 'If you love creating big or small beautiful things out of nothing, sewing,\nglue-ing, drilling, building, and you enjoy supporting others into doing it,\nKunsthaus is your place to be. A dedicated shaded space for our artists, pre\nand during event, where we offer smiles, support, advice, a few tools,\nsometimes tea or a cookie... and a lot of tips!\nNote: during Set-up and strike we work all day, with a nice deserved siesta\nafter lunch, and during event time we work in shorter shifts.\n',
    },
    {
      name: 'Art tours',
      parent: 'Creativity',
      description: "Want to shed light on the wonders that our artists bring to the event every\nyear? Give other's an insider's view and juicy details? Come join our art\ntour's team, meet the artists and take others on the ride with you. We work\nevent time in short shifts.\n",
    },
    {
      name: 'Art cars',
      parent: 'Creativity',
      description: 'Are you passionate about motorised vehicles? Love the cool and crazy rides yet\nyou care about the safety of each and every participant? Join the team! We\nsupport our creators of motorised vehicles to operate them at the event, make\nsure they understand the constraints of our desertic setting and keep the\nvehicles, themselves and others in a good shape and great to admire and enjoy.\nWe work event time in short shifts and a small team.\n',
    },
    {
      name: 'Innovation',
      parent: 'Creativity',
      description: "Is Gyro Gearloose your alter ego and you bubble with new ideas, experiments,\ntrials (and errors?). You love to hear about people's innovative, surprising\nideas and to support them into giving birth to them? Then our Innovation team\nmight be your team. Most work is pre-event, in support of the development phase\nand exploration of people's ideas. Jump on board if you're curious! We work\nevent time in short shifts and a small team.\n",
    },
    {
      name: 'Fire Arena',
      parent: 'Malfare',
      description: 'You love the smell of paraffin and you are passionate about fire performing and\nwilling to share your skills and to support the Nowhere fire community. You\nlove hippies and especially enjoy detracting them from putting those lovely\nplastic-y butterfly wings (and themselves) on fire? Come help us with\nmotivating people, getting the arena watched after, secured and organised...\nand of course, enjoy the show! We work event time in short shifts and a small\nteam.\n',
      skills: ['fire safety experience'],
    },
    {
      name: 'Power',
      parent: 'SLAP',
      description: 'We power all NORG structures, like Middle of Nowhere or the Red Cross, but also\nArt and Innovation projects around all site. Want to help keep the power on?\nJoin us! We work both during Set-up and Strike (all day) then event time (in\nshifts).\n',
    },
    {
      name: 'Sound',
      parent: 'SLAP',
      description: 'We run the sound a Middle of Nowhere and provide advice to barrios in the\ndifferent Sounds Zones on site. Want to help the sound happen for the amazing\nbands and workshops that happen at Middle of Nowhere? Join us! We work mostly\nevent time, in shifts.\n',
    },
    {
      name: 'Lights',
      parent: 'SLAP',
      description: 'We make sure all NORG structures, like Middle of Nowhere or Gate, but also Art\nand Innovation projects around all site are illuminated, to be safer and also\nlook pretty cool !! Want to shine light on Nowhere? Join us! We work mostly\nevent time, in shifts\n',
    },
    {
      name: 'Build Crew',
      parent: 'BDSM',
      description: 'Create Nowhere from the dirt! This team is responsible for taking the blank\nfield of dirt and turning it into Middle of Nowhere, Malfare, Gate, Perimeter,\nOhana House, Signs, trenches for power and so much more. You will be placed on\na project or team... maybe even a few projects or teams... to help change the\nfield of dirt into a temporary city. If you have specific skills such as\ncarpentry or rigging, please let us know! Note: during Set-up and strike we\nwork all day, with a nice deserved siesta after lunch, it\u2019s not a shift system\nlike during event time.\n',
    },
    {
      name: 'Strike Crew',
      parent: 'BDSM',
      description: 'We are the team who helps make sure that there is No Trace that anything ever\nhappened, taking down all Norg structures and packing them in containers for\nnext year. We are the die hard ones, We are the line sweepers, the compost\nchampions, we are the perimeter clearers. Strike runs from the 9th of July\nuntil the last piece of idiot tape has been removed from site. you can\nvolunteer for the whole period or just a part (leave anytime between these\ndates).\nNote: during Set-up and strike we work all day, with a nice deserved\nsiesta after lunch, it\u2019s not a shift system like during event time.\n',
    },
    {
      name: 'Toolhaus',
      parent: 'BDSM',
      description: 'Toolhaus is responsible for all tools we use to build and take down our city,\nand in charge of the Heavy Machinery Team. We work full days during Set-up and\nStrike in a small team under the shade, come join us! If you have any kind of\nlicence to operate heavy machinery it\u2019s a plus!\n',
    },
    {
      name: 'LNT',
      parent: 'BDSM',
      description: 'Our team is committed to ensure that we respect the environment and that we\nleave NO physical trace of our activity wherever we gather. This crew will work\nwith barrios and artists to ensure their LNT procedure is adhered to, be on\nhand to provide advice, and will ensure that any updates to existing LNT\npractices or procedures are communicated. We work both during Set-up and Strike\n(all day) then event time (in shifts).\n',
    },
    {
      name: 'Interpreters',
      parent: 'Malfare',
      description: 'The Interpreters team help our multi-language participants communicate with our\nemergency services, translating into Spanish as many languages as possible.\nMinimum requirement is English to Spanish but we invite all French, Dutch,\nGerman people, and many more to apply as well! We work event time on shifts.\n',
      skills: ['languages'],
    },
    {
      name: 'Site Lead & Site Management Crew',
      parent: 'Participants Wellness',
      description: 'This team is part of the Participants Wellness Department \u2192 This team is in\ncharge of making sure our site is in order and safe by checking structures (and\nrepairing broken bits), supporting Barrios in case of storm arrival, making\nsure our fire extinguishers are placed etc...etc...The Site Lead is also\nresponsible for ensuring safety and wellbeing of volunteers on shift (or in\nother words... make sure you people eat the food and remind them to drink the\nwater and that sometimes they might need to sit down for a minute). We work\nevent time on shifts.\n',
    },
    {
      name: 'Malfare Office',
      parent: 'Malfare',
      description: "For more experienced hands, or those with applicable real-world skills, we have\nthese leading roles. Malfare Shift Leads deals with all things people on-site\nand their Assistant, well, assist them. This role works closely with the Site\nLead and Site Mgmt Crew, who deal with structures, the estate, and non-people\nthings. Together, the on-duty team are responsible for everyone and everything\non site during their shift. If you've done one of these before, please sign up\nhere. We work event time on eight hour shifts.\n",
    },
    {
      name: 'Nomads',
      parent: 'Malfare',
      description: "Nomads are members of the Nowhere community who volunteer some of their time to\ndispense information and act as non-confrontational mediators. Responding to\nthe ever-changing environment, Nomads promote awareness of potential hazards,\nfrom sunstroke to wet weather, and address situations that could otherwise\nrequire outside intervention. The most important 'qualification' for being a\nNomad is the desire to be an interactive participant. Helpful qualities include\na sense of humour, flexibility, and a good pair of walking shoes. Whenever\npossible, first-time Nomads will be paired with experienced Nomads \u2014 as well as\nhaving the support from an experienced leadership team. We work event time on\nsix hour shifts.\n",
      quirks: ['sober shift'],
      skills: ['calm under pressure', 'mediation'],
    },
    {
      name: 'Designated Driver',
      parent: 'BDSM',
      description: 'Designated drivers are people willing to do a sober shift on stand-by. To do\nthis, you need to be licensed to drive a people-carrier/small van in Spain (we\nprovide the vehicle). Trips may include picking up people from the\nhealth-centre where they have no other means of getting back, going on errands\nto town to bring back supplies, acting as one of the resources when we go into\nsituation response mode. We work event time on six hour shifts.\n',
      quirks: ['sober shift'],
      skills: ['licensed to drive in Spain'],
    },
    {
      name: 'La Cantina',
      parent: 'Volunteers',
      description: 'The mission of this team is to prepare breakfast, lunch and dinner for all the\nvolunteers working out there in the dust! We work both during Set up and\nstrike, where in the down time you\u2019ll be helping the crew with various other\ntasks, than event time in shorter shifts.\n',
      location: 'cantina',
      quirks: ['intense work'],
      skills: ['you like cooking', "don't break under stress"],
    },
    {
      name: 'Grumpy Katz Gate Krew',
      parent: 'GG&P',
      description: "The Grumpy Katz are our gate-keepers, the 'guardians of the wall', the visible\nfrontier between the real world and Nowhere; they check tickets and give out\nwristbands, they oversee all entry and exit from our gates, helping vehicles\nand people\u00b4s traffic onsite. Katz are the first ones you\u00b4ll meet on the way in\nand last one you\u00b4ll say goodbye to on the way out. We work in shifts, stating\none week before the official opening and finishing after the last bus has left\non Monday\n",
      quirks: ['work in the shade'],
    },
    {
      name: 'Perimeter Crew',
      parent: 'GG&P',
      description: 'The Perimeter Crew is dedicated to watch over the edges of Nowhere and make\nsure they stay safe, protect the community within the event while walking\naround our compass shaped city. We also help the Grumpy Kats dealing with the\nincoming and outgoing traffic in Entry end Exodus days. We work event time in\nfour to six hours shifts.\n',
    },
    {
      name: 'Greeters',
      parent: 'GG&P',
      description: "Greeters are the fluffy and sparkly side of the G,P & G team, they welcome old\nand new Nobodies, explaining the 'house rules' and how to move around our city.\nThey tend to dispense hugs and spanking, depending on likes :-) We work event\ntime in six hours shifts.\n",
    },
    {
      name: 'Event Production Office',
      parent: 'Production',
      description: 'The Event Production Department is responsible for the overall administration\nand project management of the festival. This includes coordinating with the\nother departments as well as handling several legal, financial and\ninfrastructural aspects of the event such as the site permit, site\ninfrastructure, departmental purchasing, ice, and buses. Also poop. The\nProduction Office is the hub where all these operations happen, we provide info\nand support to all teams acting like the glue which keeps all things\ntogether....ish. We work event time in 4 to 6 hours shifts\n',
    },
    {
      name: 'Ice Ice Baby!',
      parent: 'Production',
      description: 'The coolest place at Nowhere, where volunteers help the sale of ice onsite\nduring the event. Shifts are four hours and you are guaranteed to meet some\nreally incredible people. Plus think of the gifts... everyone loves the ice\ncrew! We work event time on 4 hours shifts.\n',
    },
    {
      name: 'Ohana House',
      parent: 'Creativity',
      description: 'Working with the inclusion team to make an accessible sober space, kids\nfriendly.\n',
    },
    {
      name: 'Shit Ninjas',
      parent: 'Production',
      description: 'The real Heroes of Nowhere!!**!** Everyone likes a nice comfy bit of alone\ntime, and you\u2019re the people that make this happen. You\u2019ll do a brief trip round\nthe site tidying up the compost toilets and making sure they\u2019ve got paper, hand\nsanitizer and other needed items in them. We work event time on 4 hours shifts.\n',
    },
    {
      name: 'Welfare Enough',
      parent: 'Malfare',
      description: 'Welfare Enough is a place for caring people who are good listeners and make a\ngreat cup of tea! We work with Malfare to assist people who may have partied a\nlittle too hard or for whom the overall experience has become a little too\nmuch. Throughout the event we provide a 24-hour safe and sober space for\nparticipants to collect themselves, receive some support, or simply have a\nrefreshing non-alcoholic beverage. Volunteers work event time on 4 hour shifts\n(2x).\n',
    },
  ],
}

const leadDefaults = {
  title: 'Lead',
  priority: 'essential',
  policy: 'requireApproval',
}

export const createUnitFixtures = (Volunteers) => {
  if (Volunteers.collections.division.find().count() === 0) {
    units.divisions.forEach((doc) => {
      console.log(`creating division ${doc.name}`)
      const id = Volunteers.collections.division.insert(doc)
      Roles.createRole(id)
    })
  }
  if (Volunteers.collections.department.find().count() === 0) {
    units.departments.forEach((dep) => {
      console.log(`creating department and meta-lead ${dep.name}`)
      const parentId = Volunteers.collections.division.findOne({ name: dep.parent })._id
      const depId = Volunteers.collections.department.insert({
        ...dep,
        parentId,
      })
      Volunteers.collections.lead.insert({
        ...leadDefaults,
        description: `Meta-Lead of the ${dep.name} department.`,
        parentId: depId,
      })
      Roles.createRole(depId)
      Roles.addRolesToParent(depId, parentId)
    })
  }
  if (Volunteers.collections.team.find().count() === 0) {
    units.teams.forEach((team) => {
      console.log(`creating team and lead ${team.name}`)
      const parentId = Volunteers.collections.department.findOne({ name: team.parent })._id
      const teamId = Volunteers.collections.team.insert({
        ...team,
        parentId,
      })
      Volunteers.collections.lead.insert({
        ...leadDefaults,
        description: `Lead of the ${team.name} team.`,
        parentId: teamId,
      })
      Roles.createRole(teamId)
      Roles.addRolesToParent(teamId, parentId)
    })
  }
}
