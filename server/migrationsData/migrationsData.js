export const voluntellEmail = {
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

Contacts:
{{#each teams }}
{{#if email}}
- {{name}} : {{email}}
{{/if}}
{{/each}}

This is an automated message, please contact the shift lead if you have questions.
Ceci est un message automatisé, s'il vous plaît contacter le chef de quart si vous avez des questions.
Este es un mensaje automatizado, contáctese con el líder del turno si tiene preguntas.
`,
  notes: 'For when you voluntell a user',
}

export const reviewEmail = {

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
}

export const reminderEmail = {
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
}

export const enrollInvalidEmail = {
  from: 'volunteers@goingnowhere.org',
  subject: 'Nowhere: More enrollment links (because you got more than one ticket) !',
  body: `Hello {{user.firstName}} {{#if user.nickname}}/ ( {{user.nickname}}) {{/if}}


Since we found more than one ticket associated to the same email address, we write to you
to kindly forward the following link to join the volunteer website to the rigthfull
ticket holder.

{{tickets.FirstName}} {{tickets.LastName}} (ticker number {{ tickets.TicketId }})

{{tickets.enrollmentLink}}

Since this is an unsual situation, after logging in and setting up a password,
you need to go thought one additional step and assocate a valid email to this account.

The link above will take you to an initial registration form where you will be asked
for a password and to agree to the GDPR regulations. After this step, you will be
asked to add a valid email (this must be the email of the ticket holder). We'll send
you an email to confirm.

After this step, you can finally continue to fill the volunteer profile and
select a shift or two.

If in the mean time you sold or gifted the ticket, and you have already tranfer
the ticket to the new owner, please disregard this message.

You are going to receive one email for each ticket associated to this email address.

Thank you for your help.

This is an automated message, please contact the volunteer coordinator if you have questions.
`,
  notes: 'For when people got more than one ticket with the same email address',
}
