var migrates = require('../migration/migrates');
var db = require('tresdb-db');
var readline = require('readline');

db.init(function (dbErr) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  // Prompt about backups
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log();
  console.log('WARNING: If migration somehow fails, the data may');
  console.log('become corrupted. Backing up with \'mongodump\' is');
  console.log('highly recommended.');
  console.log();
  rl.question('Is the database backed up? [Y/n] ', function (answer) {
    // Close the console interface. Prevents program to exit.
    rl.close();

    if (typeof answer !== 'string' || answer.length === 0 ||
        answer[0] !== 'Y') {
      console.log('Back up the database before migration.');
      db.close();
      return;
    }

    // Answer is YES.
    migrates.migrate(function (err) {
      if (err) {
        console.error(err);
      }

      db.close();
    });
  });
});
