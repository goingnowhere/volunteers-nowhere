Package.describe({
  name: 'abate:formbuilder',
  version: '0.0.1',
  summary: 'Wrapper for formbuilder.online',
  git: '',
  documentation: 'README.md'
});

Npm.depends({
  'jquery': "3.1.1",
  'jquery-ui': "1.12.1",
  "jquery-ui-sortable": "1.0.0",
  "formBuilder": "1.24.3",
  "meteor-node-stubs": "0.2.4"
});


Package.onUse(function(api) {
  api.versionsFrom('1.4');

  api.use([
    'peerlibrary:server-autorun'
  ]);

  api.use([
    'ecmascript',
    'aldeed:simple-schema',
    'mongo',
    'underscore',
    'iron:router'
  ], ['client', 'server']);

    api.use( [
      // 'templates:forms@2.1.4',
      'templating',
    ], 'client');

  api.add_files([
    'both/collections.js',
    'both/helpers.js',
    'both/router.js',
    'api.js'
  ], ["client","server"]);

  // api.add_files([
  //   'server/methods/api.js',
  //   'server/publish.js',
  // ], ["server"]);

  api.add_files([
    'client/formbuilder.html',
    'client/formbuilder.js',
    // 'client/formrender.html',
    // 'client/formrender.js',
  ], ["client"]);

  api.export([ 'FormBuilder' ]);

});
