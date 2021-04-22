const config = require('tresdb-config');
const tempdirs = require('../../server/services/tempdirs');

exports.run = function (callback) {

  const tempRoot = config.tempUploadDir;
  const ttlSeconds = config.tempUploadTimeToLive;

  tempdirs.removeOlderThan(tempRoot, ttlSeconds, (err, names) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Temporary dir does not exist.
        names = [];
      } else {
        console.log('cleartemp: ERROR in removeOlderThan');
        return callback(err);
      }
    }

    const n = names.length;
    console.log('cleartemp: removed ' + n + ' temporary directories.');
    names.forEach((name, index) => {
      console.log('  (' + index + ') ' + name);
    });

    return callback(); // success
  });

};
