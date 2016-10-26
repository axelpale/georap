var migrates = require('./lib/migrates');

migrates.migrate(function (err) {
  if (err) {
    console.error(err);
  }
});
