'use strict';

var app = require('devebot').launchApplication({
  appRootPath: __dirname
}, [
  'app-tracelog',
  'app-webweaver'
], []);

if (require.main === module) app.server.start();

module.exports = app;
