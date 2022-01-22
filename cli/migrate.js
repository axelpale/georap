const migrates = require('../migration/migrates');
const db = require('georap-db');
const readline = require('readline');

db.init((dbErr) => {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  // Prompt about backups
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log();
  console.log('WARNING: If migration somehow fails, the data may');
  console.log('become corrupted. Backing up with \'mongodump\' is');
  console.log('highly recommended.');
  console.log();
  console.log('For example:');
  console.log('  $ mongodump --username <name> --password <pwd> --db georap');
  console.log();
  rl.question('Is the database backed up? [Y/n] ', (answer) => {
    // Close the console interface. Prevents program to exit.
    rl.close();

    if (typeof answer !== 'string' || answer.length === 0 ||
        answer[0] !== 'Y') {
      console.log('Back up the database before migration.');
      db.close();
      return;
    }

    // Answer is YES.
    migrates.migrate((err) => {
      if (err) {
        console.error(err);
      }

      db.close();
    });
  });
});
