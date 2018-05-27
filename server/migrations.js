import { EmailForms } from 'meteor/abate:email-forms'
import { Migrations } from 'meteor/percolate:migrations'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/piemonkey:roles'
import { FormBuilder } from 'meteor/abate:formbuilder'
import { moment } from 'meteor/momentjs:moment'
import { Volunteers } from '../both/init'
import { EventSettings } from '../both/settings'
import { importUsers } from './importUsers'
import { EmailLogs } from './email'

Migrations.config({
  log: true,
  logIfLatest: false,
})

Migrations.add({
  version: 1,
  name: 'add user and site context',
  up() {
    EmailForms.Collections.EmailTemplateContext.remove({})
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'User',
      namespace: 'user',
      variables: [
        { name: 'firstName', description: 'first name from profile' },
        { name: 'email', description: 'first verified email' },
      ],
    })
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Site',
      namespace: 'site',
      variables: [
        { name: 'url', description: 'absolute URL of the site' },
      ],
    })
  },
})

Migrations.add({
  version: 2,
  name: 'Make three admins',
  up() {
    const pm = Accounts.findUserByEmail('piemonkey@gmail.com')
    const dr = Accounts.findUserByEmail('dr.munga@gmail.com')
    const hc = Accounts.findUserByEmail('hardcastle@goingnowhere.org')
    if (pm) { Roles.addUsersToRoles(pm._id, 'admin') }
    if (dr) { Roles.addUsersToRoles(dr._id, 'admin') }
    if (hc) { Roles.addUsersToRoles(hc._id, 'admin') }
  },
})


Migrations.add({
  version: 3,
  name: 'Move fod-name to user account',
  up() {
    const volunteerForm = FormBuilder.Collections.DynamicForms.findOne({ name: 'VolunteerForm' })
    const fodNameField = volunteerForm.form.find(field => field.label.includes("Name / Field of Dirt (it's not a playa) Name"))
    Volunteers.Collections.VolunteerForm.find().map((vol) => {
      if (vol[fodNameField.name]) {
        Meteor.users.update(vol.userId, { $set: { 'profile.nickname': vol[fodNameField.name] } })
      }
    })
  },
})

Migrations.add({
  version: 4,
  name: 'Update Profile for existing Users',
  up() {
    Meteor.users.find().fetch().forEach((user) => {
      Meteor.users.update({ _id: user._id }, {
        $set: {
          'profile.ticketNumber': 'Manual registration',
          'profile.ticketDate': new Date(),
          'profile.manualRegistration': true,
        },
      })
    })
  },
})

Migrations.add({
  version: 5,
  name: 'Add guest list guests-2018-05-14.json',
  up() {
    importUsers('users/guests-2018-05-14.json')
  },
})

Migrations.add({
  version: 6,
  name: 'add user and site context',
  up() {
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Tickets',
      namespace: 'tickets',
      variables: [
        { name: 'users', description: 'additional tickets associated to this email' },

      ],
    })
  },
})

Migrations.add({
  version: 7,
  name: 'Cleanup removed shifts',
  up() {
    Volunteers.Collections.TeamShifts.find().forEach((shift) => {
      if (!Volunteers.Collections.Team.findOne(shift.parentId)) {
        console.log('remove stale shift ', shift.title)
        Volunteers.Collections.TeamShifts.remove(shift._id)
      }
    })
    Volunteers.Collections.ShiftSignups.find().forEach((signup) => {
      if (!Volunteers.Collections.TeamShifts.findOne(signup.shiftId)) {
        const user = Meteor.users.findOne(signup.userId)
        const team = Volunteers.Collections.Team.findOne(signup.parentId)
        const email = ((user) ? user.emails[0].address : '')
        const title = ((team) ? team.name : '')
        console.log(`remove stale signup for ${email} (${title})`)
        Volunteers.Collections.ShiftSignups.update(signup._id, { $set: { status: 'cancelled' } })
      }
    })
  },
})

Migrations.add({
  version: 8,
  name: 'Add RotaId to all existing rotas',
  up() {
    const allShifts = Volunteers.Collections.TeamShifts.find({ groupId: { $ne: null } }).fetch()
    console.log('Total Shifts ', allShifts.length)
    const grouppedShifts = _.groupBy(allShifts, 'groupId')
    console.log('Total Rotas ', Object.keys(grouppedShifts).length)
    Object.entries(grouppedShifts).forEach(([groupId, shifts]) => {
      const dayGrouppedShifts = _.groupBy(shifts, s => moment(s.start).dayOfYear())
      console.log('Total Sub Rotas by day', Object.keys(dayGrouppedShifts).length)
      Object.values(dayGrouppedShifts).forEach((shiftsByDay) => {
        _.sortBy(shiftsByDay, s => s.start)
        shiftsByDay.forEach((v, i) => {
          console.log(`update ${v.title} with rotaId ${i}`)
          Volunteers.Collections.TeamShifts.update(v._id, { $set: { rotaId: parseInt(i) } })
        })
      })
    })
  },
})

Migrations.add({
  version: 9,
  name: 'add lead, shift and project context',
  up() {
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Shifts',
      namespace: 'duties',
      variables: [
        {
          name: 'shifts', description: 'shifts signup associated to the user',
        },
      ],
    })
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Leads',
      namespace: 'duties',
      variables: [
        {
          name: 'leads', description: 'leads signup associated to the user',
        },
      ],
    })
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'Projects',
      namespace: 'duties',
      variables: [
        {
          name: 'projects', description: 'projects signup associated to the user',
        },
      ],
    })
  },
})

const cleanSignups = (collection, shiftCollection, lead = false) => {
  collection.find().forEach((signup) => {
    const user = Meteor.users.findOne({ _id: signup.userId })
    if (!user) {
      console.log('remove signup: user not found')
      collection.remove(signup._id)
    }
    const shift = shiftCollection.findOne({ _id: signup.shiftId })
    if (!shift) {
      console.log('remove signup: shift not found')
      collection.remove(signup._id)
    }
    const team = Volunteers.Collections.Team.findOne({ _id: signup.parentId })
    if (!team) {
      if (lead) {
        const dept = Volunteers.Collections.Department.findOne({ _id: signup.parentId })
        if (!dept) {
          console.log('remove signup: team or dept not found')
          collection.remove(signup._id)
        }
      } else {
        console.log('remove signup: team not found')
        collection.remove(signup._id)
      }
    }
  })
}

Migrations.add({
  version: 10,
  name: 'cleanup shift signups',
  up() {
    cleanSignups(
      Volunteers.Collections.ShiftSignups,
      Volunteers.Collections.TeamShifts,
    )
    cleanSignups(
      Volunteers.Collections.ProjectSignups,
      Volunteers.Collections.Projects,
    )
    cleanSignups(
      Volunteers.Collections.LeadSignups,
      Volunteers.Collections.Lead,
      true,

    )
  },
})

Migrations.add({
  version: 11,
  name: 'Add and set EventSettings.cronFrequency (disable emails)',
  up() {
    EventSettings.update({}, { $set: { cronFrequency: '' } })
  },
})

Migrations.add({
  version: 12,
  name: 'Add voluntell email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'voluntell' }, {
      $set: {
        context,
        from: 'noreply@goingnowhere.org',
        subject: 'NOWHERE SHIFT ASSIGNMENT',
        body: `VOLUNTOLD!

Congratulations, you’ve been assigned a shift, it's:
Félicitations, on vous a assigné un équipe, c’est:
Felicidades, te han asignado un turno, es:
{{#if $gt ($len duties.newShiftEnrollments) 0 }}Shifts
{{#each duties.newShiftEnrollments }}
- {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.newProjectEnrollments) 0 }}Projects
{{#each duties.newProjectEnrollments }}
- {{teamName}} > {{title}} . You are set to start the {{$formatDateTime start}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.newLeadEnrollments) 0 }}Leads
{{#each duties.newLeadEnrollments }}
- {{teamName}} > {{title}}
{{/each}}
{{/if}}

This is a summary of all your engagements. Please pay attention !
{{#if $gt ($len duties.shifts) 0 }}Shifts
{{#each duties.shifts }}
- {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.projects) 0 }}Projects
{{#each duties.projects }}
- {{teamName}} > {{title}} . You are set to start the {{$formatDateTime start}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.leads) 0 }}Leads
{{#each duties.leads }}
- {{teamName}} > {{title}}
{{/each}}
{{/if}}

This is an automated message, please contact the shift lead if you have questions.
Ceci est un message automatisé, s'il vous plaît contacter le chef de quart si vous avez des questions.
Este es un mensaje automatizado, contáctese con el líder del turno si tiene preguntas.
`,
        notes: 'For when you voluntell a user',
      },
    })
  },
})

Migrations.add({
  version: 13,
  name: 'Set Enrolled flag for all signups',
  up() {
    const modifier = { $set: { enrolled: true, notification: false } }
    Volunteers.Collections.ShiftSignups.update({}, modifier, { multi: true })
    Volunteers.Collections.ProjectSignups.update({}, modifier, { multi: true })
    Volunteers.Collections.LeadSignups.update({}, modifier, { multi: true })
  },
})

Migrations.add({
  version: 14,
  name: 'Add reviewed email template',
  up() {
    const sel = { name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }
    const context = EmailForms.Collections.EmailTemplateContext.find(sel).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'reviewed' }, {
      $set: {
        context,
        from: 'noreply@goingnowhere.org',
        subject: 'Your shift application at nowhere has been reviewed',
        body: `Dear {{user.firstName}} {{#if user.nickName}}/ {{user.nickName}}{{/if}}

You applied for a shift subject to approval from a team lead.

{{#if $gt ($len duties.newShiftReviews) 0 }}
  {{#each duties.newShiftReviews }}
    {{#if $eq status 'confirmed'}}
The shift {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}} ,
has been approved. Please put these dates in your agenda.
    {{/if}}
    {{#if $eq status 'refused'}}
The application for the shift {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}} ,
has been refused. Don't be put down by this. We need to take multiple factors into
consideration while putting together a crew. If you think there is a mistake, please contact
the volunteer coordinator or team lead directly. Otherwise take your time to apply to
another shift.
    {{/if}}
    {{/each}}
{{/if}}

{{#if $gt ($len duties.newProjectReviews) 0 }}
  {{#each duties.newProjectReviews }}
    {{#if $eq status 'confirmed'}}
The application for {{teamName}} > {{title}} starting {{$formatDateTime start}},
has been approved. Please put these dates in your agenda.
    {{/if}}
    {{#if $eq status 'refused'}}
The application for the project {{teamName}} > {{title}} starting {{$formatDateTime start}},
has been refused. Don't be put down by this. We need to take multiple factors into
consideration while putting together a crew. If you think there is a mistake, please contact
the volunteer coordinator or team lead directly. Otherwise take your time to apply to
another shift.
    {{/if}}
  {{/each}}
{{/if}}
{{#if $gt ($len duties.newLeadReviews) 0 }}
  {{#each duties.newLeadReviews }}
    {{#if $eq status 'confirmed'}}
The application for the lead position {{teamName}} > {{title}},
has been approved. Please get in touch with your metalead or the volunteer coordinator.
    {{/if}}
    {{#if $eq status 'refused'}}
The application for the lead position {{teamName}} > {{title}},
has been refused. Don't be put down by this. We need to take multiple factors into
consideration while putting together a crew. If you think there is a mistake, please contact
the volunteer coordinator. Otherwise take your time to apply to another shift.
    {{/if}}
  {{/each}}
{{/if}}
This is a summary of all your engagements at the moment. Please be on time !
{{#if $gt ($len duties.shifts) 0 }}Shifts
  {{#each duties.shifts }}
- ({{status}}) : {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}}
  {{/each}}
{{/if}}
{{#if $gt ($len duties.projects) 0 }}Projects
  {{#each duties.projects }}
- ({{status}}) : {{teamName}} > {{title}} . You are set to start the {{$formatDateTime start}}
  {{/each}}
{{/if}}
{{#if $gt ($len duties.leads) 0 }}Leads
  {{#each duties.leads }}
- ({{status}}) : {{teamName}} > {{title}}
  {{/each}}
{{/if}}

This is an automated message, please contact the shift lead if you have questions.
Ceci est un message automatisé, s'il vous plaît contacter le chef de quart si vous avez des questions.
Este es un mensaje automatizado, contáctese con el líder del turno si tiene preguntas.
`,
        notes: 'For when you voluntell a user',
      },
    })
  },
})

Migrations.add({
  version: 15,
  name: 'Fix voluntell email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'voluntell' }, {
      $set: {
        context,
        from: 'noreply@goingnowhere.org',
        subject: 'NOWHERE SHIFT ASSIGNMENT',
        body: `VOLUNTOLD!

Congratulations, you’ve been assigned a shift, it's:
Félicitations, on vous a assigné un équipe, c’est:
Felicidades, te han asignado un turno, es:
{{#if $gt ($len duties.newShiftEnrollments) 0 }}Shifts
{{#each duties.newShiftEnrollments }}
- {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.newProjectEnrollments) 0 }}Projects
{{#each duties.newProjectEnrollments }}
- {{teamName}} > {{title}} . You are set to start the {{$formatDateTime start}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.newLeadEnrollments) 0 }}Leads
{{#each duties.newLeadEnrollments }}
- {{teamName}} > {{title}}
{{/each}}
{{/if}}

This is a summary of all your engagements. Please pay attention !
{{#if $gt ($len duties.shifts) 0 }}Shifts
{{#each duties.shifts }}
- ({{status}}) : {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.projects) 0 }}Projects
{{#each duties.projects }}
- ({{status}}) : {{teamName}} > {{title}} . You are set to start the {{$formatDateTime start}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.leads) 0 }}Leads
{{#each duties.leads }}
- ({{status}}) : {{teamName}} > {{title}}
{{/each}}
{{/if}}

This is an automated message, please contact the shift lead if you have questions.
Ceci est un message automatisé, s'il vous plaît contacter le chef de quart si vous avez des questions.
Este es un mensaje automatizado, contáctese con el líder del turno si tiene preguntas.
`,
        notes: 'For when you voluntell a user',
      },
    })
  },
})

Migrations.add({
  version: 16,
  name: 'Set Reviewed flag for all signups',
  up() {
    const sel = { status: 'pending', reviewed: null }
    const modifier = { $set: { reviewed: false } }
    Volunteers.Collections.ShiftSignups.update(sel, modifier, { multi: true })
    Volunteers.Collections.ProjectSignups.update(sel, modifier, { multi: true })
    Volunteers.Collections.LeadSignups.update(sel, modifier, { multi: true })
  },
})

Migrations.add({
  version: 17,
  name: 'shift reminder email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Shifts', 'Leads', 'Projects'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'shiftReminder' }, {
      $set: {
        context,
        from: 'noreply@goingnowhere.org',
        subject: 'Nowhere Shifts Reminder',
        body: `Hello,

This is a reminder regarding all your engagements at nowhere .
{{#if $gt ($len duties.shifts) 0 }}Shifts
{{#each duties.shifts }}
- ({{status}}) : {{teamName}} > {{title}} {{$formatDateTime start}} - {{$formatDateTime end}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.projects) 0 }}Projects
{{#each duties.projects }}
- ({{status}}) : {{teamName}} > {{title}} . You are set to start the {{$formatDateTime start}}
{{/each}}
{{/if}}
{{#if $gt ($len duties.leads) 0 }}Leads
{{#each duties.leads }}
- ({{status}}) : {{teamName}} > {{title}}
{{/each}}
{{/if}}

This is an automated message, please contact the shift lead if you have questions.
Ceci est un message automatisé, s'il vous plaît contacter le chef de quart si vous avez des questions.
Este es un mensaje automatizado, contáctese con el líder del turno si tiene preguntas.
`,
        notes: 'Friendly reminder',
      },
    })
  },
})

Migrations.add({
  version: 18,
  name: 'Set invitationSent flag to all people with verified email',
  up() {
    const sel = { 'emails.$.verified': true }
    const modifier = { $set: { 'profile.invitationSent': true } }
    Meteor.users.update(sel, modifier, { multi: true })
    const tid = EmailForms.Collections.EmailTemplate.findOne({ name: 'enrollAccount' })._id
    EmailLogs.find({ template: tid }).forEach((log) => {
      Meteor.users.update(log._id, modifier, { multi: true })
    })
  },
})

Migrations.add({
  version: 19,
  name: 'Move rota from team to team',
  up() {
    const newTeam = Volunteers.Collections.Team.findOne({ name: 'Event-Time Maintenance' })
    const oldTeam = Volunteers.Collections.Team.findOne({ name: 'Site Leads' })
    if (newTeam) {
      Volunteers.Collections.TeamShifts.update(
        { title: 'Event-Time Maintenance Crew', parentId: oldTeam._id },
        { $set: { parentId: newTeam._id } },
        { multi: true },

      )
    }
  },
})

Migrations.add({
  version: 20,
  name: 'add afftected teams context',
  up() {
    EmailForms.Collections.EmailTemplateContext.insert({
      name: 'UserTeams',
      namespace: 'teams',
      variables: [
        { name: 'name', description: 'name of the team' },
        { name: 'email', description: 'contact email for the team' },
      ],
    })
  },
})

Migrations.add({
  version: 21,
  name: 'add enrollAccountInvalidEmail email template',
  up() {
    const context = EmailForms.Collections.EmailTemplateContext.find({ name: { $in: ['User', 'Tickets'] } }).map(c => c._id)
    EmailForms.Collections.EmailTemplate.upsert({ name: 'enrollAccountInvalidEmail' }, {
      $set: {
        context,
        from: 'volunteers@goingnowhere.org',
        subject: 'Nowhere: More enrollment links (because you got more than one ticket) !',
        body: `Hello {{ user.firstName}} {{#if user.nickname}}/ ( {{user.nickname}}) {{/if}}


Since we found more than one ticket associated to the same email address, we write to you
to kindly forward the following link to join the volunteer website to the rigthfull
ticket holder.

{{tickets.FirstName}} {{tickets.LastName}} (ticker number {{ tickets.TicketId }})

{{tickets.enrollmentLink}}

Since this is an unsual situation, after logging in and setting up a password,
you need to go thought one additional step and assocate a valid email to this account.

After logging in proceed to https://vms.goingnowhere.org/profile/settings
and complete your profile form adding the real name of the ticket holder, and more
importantly a new valid email (you will be asked to confirm the email address).

After this step, you can continue to fill the volunteer profile and finally
select a shift or two.

If in the mean time you sold or gifted the ticket, and you have already tranfer the ticket to the new
owner, please disregard this message.

You are going to receive one email for each ticket associated to this email address.

Thank you for your help.

This is an automated message, please contact the volunteer coordinator if you have questions.
`,
        notes: 'For when people got more than one ticket with the same email address',
      },
    })
  },
})

Migrations.add({
  version: 22,
  name: 'reset invitationSent flag for invalid emails',
  up() {
    Meteor.users.update({ 'emails.0.address': { $not: /@email.invalid/ } }, { $set: { 'profile.invitationSent': false } }, { multi: true })
  },
})
