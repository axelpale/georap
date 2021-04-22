const db = require('tresdb-db');
const loadFixture = require('./lib/loadFixture');

module.exports = function (callback) {
  // Build a loadable fixture without any collections.
  const fixture = {
    collections: {},
    indices: db.INDICES,
  };

  loadFixture(fixture, (err) => {
    if (err) {
      console.error('Loading indices failed.');
      return callback(err);
    } // else

    console.log('Indices were created successfully.');
    return callback();
  });
};
