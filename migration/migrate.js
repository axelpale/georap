var migrates = require('./lib/migrates');

migrates.migrate(function (err) {
  if (err) {
    throw err;
  }
});
