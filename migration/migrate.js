var local = require('../config/local');
var migrates = require('./lib/migrates');
var monk = require('monk');

// DB
var db = monk(local.mongo.url);

migrates.migrate({
  db: db,
  callback: function (err) {
    if (err) {
      console.error(err);
    }

    db.close();
  },
});
