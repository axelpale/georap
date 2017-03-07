/* eslint-disable global-require */
var async = require('async');

var v = {
  0: require('./v0v1'),
  1: require('./v1v2'),
  2: require('./v2v3'),
  3: require('./v3v4'),
  4: require('./v4v5'),
  5: require('./v5v6'),
  6: require('./v6v7'),
};


var getSteps = function (currentVersion, targetVersion) {
  // Returns array of migration functions

  var i;
  var steps = [];

  for (i = currentVersion; i !== targetVersion; i += 1) {
    if (v.hasOwnProperty(i)) {
      steps.push(v[i].run);
    } else {
      throw new Error('No migration steps available from v' + i +
                      ' to v' + (i + 1));
    }
  }

  return steps;
};

exports.run = function (currentVersion, targetVersion, callback) {
  // Executes the migration
  //
  // Parameters
  //   currentVersion
  //     int
  //   targetVersion
  //     int
  //   callback
  //     function (err)

  var steps;

  // Load steps
  try {
    steps = getSteps(currentVersion, targetVersion);
  } catch (e) {
    return callback(e);
  }

  // Run steps in series
  async.eachSeries(steps, function (step, next) {
    return step(next);
  }, function (err) {
    // Finally
    return callback(err);
  });

};
