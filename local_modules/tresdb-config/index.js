// For server-side use only.
// Configuration is passed to client via a GET handler.

var config = require('../../config');
var schema = require('./schema');
var Ajv = require('ajv');

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
