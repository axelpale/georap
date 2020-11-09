// For server-side use only.
// Configuration is passed to client via a GET handler.

var config = require('../../config');
var schema = require('./schema');
var Ajv = require('ajv');

// Ensure that config/index.js is not accidentally included in client code
// by checking the global var window.
if (typeof window !== 'undefined') {
  throw new Error('Unsecure exposal of server configuration on client side. ' +
    'Ensure that tresdb-config module is used only in server-side code.');
}

// Validate against JSON schema
var ajv = new Ajv();
var valid = ajv.validate(schema, config);

if (valid) {
  console.log('Valid configuration loaded from config/index.js.');
} else {
  console.log(ajv.errors);
  throw new Error('Invalid config/index.js detected. See above for details.');
}

module.exports = config;
