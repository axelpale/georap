var backups = require('./lib/backups');
var program = require('commander');

var listBackups = false;

program
  .version('0.0.1')
  .arguments('[cmd]')
  .action(function (cmd) {
    if (cmd === 'list') {
      listBackups = true;
    }
  })
  .parse(process.argv);

if (listBackups) {
  backups.list(function (err, namelist) {
    if (err) {
      throw err;
    }

    console.log('Available backups:');
    namelist.forEach(function (name) {
      console.log('  ' + name);
    });
  });
} else {
  backups.backup(function (err, backupName) {
    if (err) {
      console.error(err);

      return;
    }  // else

    console.log('Created backup', backupName);
  });
}
