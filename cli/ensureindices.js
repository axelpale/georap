// Ensures that the db has all the needed indices

var db = require('tresdb-db');
var tools = require('../specs/tools');
var fixture = require('./fixtures/sample');
var clone = require('clone');

db.init(function (dbErr) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  // Leave only indices
  var custom = clone(fixture);
  custom.collections = {};

  tools.loadFixture(custom, function (err) {
    if (err) {
      console.error('Loading sample data failed.');
      console.error(err);
    } else {
      console.log('Indices were created successfully.');
    }

    db.close();
  });
});
