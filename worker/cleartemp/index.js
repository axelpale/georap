var local = require('../../config/local');
var tempdirs = require('../../server/services/tempdirs');

exports.run = function (callback) {

  var tempRoot = local.tempUploadDir;
  var ttlSeconds = local.tempUploadTimeToLive;

  tempdirs.removeOlderThan(tempRoot, ttlSeconds, function (err, names) {
    if (err) {
      console.log('cleartemp: ERROR in removeOlderThan');
      return callback(err);
    }

    var n = names.length;
    console.log('cleartemp: removed ' + n + ' temporary directories:');
    names.forEach(function (name, index) {
      console.log('cleartemp: (' + index + ') ' + name);
    });

    return callback(); // success
  });

};
