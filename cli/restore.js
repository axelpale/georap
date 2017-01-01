var backups = require('../migration/backups');
var program = require('commander');

var backupName;

program
  .version('0.0.1')
  .arguments('[name]')
  .action(function (name) {
    backupName = name;
  })
  .parse(process.argv);

// If backupName is null or empty, most recent backup is used.

backups.restore(backupName, function (err, restoredName) {
  if (err) {
    if (err.name === 'InvalidBackupName') {
      console.log(err.message);
      console.log('');
      console.log('Available backups:');
      backups.list(function (err2, namelist) {
        if (err2) {
          throw err2;
        }  // else

        namelist.forEach(function (name) {
          console.log(' ', name);
        });
      });
    } else {
      console.error(err);
    }

    return;
  }  // else

  console.log('Restored', restoredName);
});
