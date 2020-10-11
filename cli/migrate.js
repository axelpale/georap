var migrates = require('../migration/migrates');

var db = require('../server/services/db');

db.init(function (dbErr) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  migrates.migrate(function (err) {
    if (err) {
      console.error(err);
    }

    db.close();
  });
});
