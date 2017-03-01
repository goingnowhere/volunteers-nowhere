Package.describe({
  name: 'abate:volunteers',
  version: '0.0.1',
  summary: 'Volunteers form',
  git: '',
  documentation: 'README.md',
});

// Npm.depends({
//   "awesome-bootstrap-checkbox": "1.0.0-alpha.4"}
// );

Package.onUse(function(api) {
  api.versionsFrom('1.4');

  api.use([
    'mongo',
    'coffeescript',
    'tap:i18n@1.8.2',
    'aldeed:collection2@2.10.0',
    'aldeed:autoform@5.8.1',
    'alanning:roles@1.2.15',
    'check',
    'underscore',
    'benmgreene:moment-range@2.10.6',
    'momentjs:moment',
    'reactive-dict',
    'reactive-var',
    'random',
    'matb33:collection-hooks'
  ], ['client', 'server']);

  api.use( [
    'reactive-var',
    'templating',
    'twbs:bootstrap',
    'natestrauser:select2',
    'zimme:select2-bootstrap3-css',
    'aldeed:autoform-select2@2.0.2',
    'drewy:datetimepicker',
    'drewy:autoform-datetimepicker',
    'drblue:fullcalendar',
  ], 'client');

  api.add_files([
    'both/global.coffee',
    "both/teams.coffee",
    "both/volunteer.coffee",
    "api.coffee"
  ], ["server","client"]);

  api.add_files([ 'package-tap.i18n', ], ['client', 'server']);
  api.add_files([
    'client/global_helpers.coffee',
    // 'client/css/awesome-bootstrap-checkbox.css',
    // 'client/css/custom.css',
    "client/frontend/volunteer.html",
    "client/frontend/volunteer.coffee",

    "client/backend/volunteer.html",
    "client/backend/volunteer.coffee",
    "client/backend/teams.html",
    "client/backend/teams.coffee",
  ], "client");

  api.add_files([
    'server/volunteer.coffee',
    'server/teams.coffee',
    'server/publications.coffee'
  ],"server");

  api.add_files([ "i18n/en.i18n.json", ], ["client", "server"]);

  api.export([ 'Volunteers' ]);
});

//Package.onTest(function(api) {
  //api.use('ecmascript');
  //api.use('tinytest');
  //api.use('i18n-inline');
  //api.mainModule('i18n-inline-tests.js');
//});
