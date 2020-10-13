var path = require('path');
var fse = require('fs-extra');

// Thumbnail
var from = path.join(__dirname, '../.data/backups', 'migration');
var to = path.join(__dirname, '../.data/db');

console.log('#### Rollback migration ####');
console.log('Ensuring the migration backup exists...');
var probe = path.join(from, 'journal'); // test if mongodb
fse.pathExists(probe, function (erex, exists) {
  if (erex) {
    console.error(erex);
    return;
  }

  if (!exists) {
    console.log('No backup found.');
    return;
  }

  console.log('Backup found.');
  console.log('Preparing the database directory...');
  fse.remove(to, function (errem) {
    if (errem) {
      console.error(errem);
      return;
    }

    console.log('Database directory prepared.');
    console.log('Populating the database with the backup...');
    fse.copy(from, to, function (ercopy) {
      if (ercopy) {
        console.error(ercopy);
        return;
      }

      console.log('Database populated.');
      console.log('#### Rollback SUCCESS ####');
      return;
    });
  });
});
