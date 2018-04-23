import { EmailForms } from 'meteor/abate:email-forms'
import { Migrations } from 'meteor/percolate:migrations'

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
