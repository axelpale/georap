// Usage:
//   $ node refresh.js

var local = require('../../../config/local');
var monk = require('monk');

var db = monk(local.mongo.url);

var clustering = require('./index');

clustering.recomputeClusters(db, function (err) {
  if (err) {
    console.log('ERROR');
    console.error(err);

    return db.close();
  }  // else

  console.log('Clusters recomputed.');

  return db.close();
});
