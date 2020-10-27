var db = require('tresdb-db');
var loadFixture = require('./lib/loadFixture');

module.exports = function (callback) {
  // Build a loadable fixture without any collections.
  var fixture = {
    collections: {},
    indices: db.INDICES,
  };

  loadFixture(fixture, function (err) {
    if (err) {
      console.error('Loading indices failed.');
      return callback(err);
    } // else

    console.log('Indices were created successfully.');
    return callback();
  });
};
