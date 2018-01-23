/* eslint-disable object-curly-newline */

const teams = ['Power', 'Build', 'NoInfo']
const teamLeads = {
  Power: [
    { title: 'Power Lead', priority: 'essential', policy: 'requireApproval' },
    { title: 'Sound Lead', priority: 'essential', policy: 'requireApproval' },
  ],
  NoInfo: [
    { title: 'Lead', priority: 'essential', policy: 'requireApproval' },
  ],
  Build: [
    { title: 'Lead', priority: 'essential', policy: 'requireApproval' },
  ],
}

const departments = ['SLaP', 'Volunteers', 'BDSM']
const departmentLeads = {
  SLaP: [
    { title: 'MetaLead', priority: 'essential', policy: 'requireApproval' },
    { title: 'Co-MetaLead', priority: 'important', policy: 'requireApproval' },
  ],
  Volunteers: [
    { title: 'MetaLead', priority: 'essential', policy: 'requireApproval' },
  ],
  BDSM: [
    { title: 'MetaLead', priority: 'essential', policy: 'requireApproval' },
  ],
}

export const createLeads = (Volunteers) => {
  if (Volunteers.Collections.Lead.find().count() === 0) {
    teams.forEach((team) => {
      teamLeads[team].forEach((doc) => {
        console.log(`creating fixture for Lead ${doc.title}`)
        const parentId = Volunteers.Collections.Team.findOne({ name: team })._id
        Volunteers.Collections.Lead.insert({
          ...doc,
          parentId,
        })
      })
    })

    departments.forEach((team) => {
      departmentLeads[team].forEach((doc) => {
        console.log(`creating fixture for Lead ${doc.title}`)
        const parentId = Volunteers.Collections.Department.findOne({ name: team })._id
        Volunteers.Collections.Lead.insert({
          ...doc,
          parentId,
        })
      })
    })
  }
}