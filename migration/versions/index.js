/* eslint-disable global-require */
const asyn = require('async');

const v = {
  0: require('./v0v1'),
  1: require('./v1v2'),
  2: require('./v2v3'),
  3: require('./v3v4'),
  4: require('./v4v5'),
  5: require('./v5v6'),
  6: require('./v6v7'),
  7: require('./v7v8'),
  8: require('./v8v9'),
  9: require('./v9v10'),
  10: require('./v10v11'),
  11: require('./v11v12'),
  12: require('./v12v13'),
  13: require('./v13v14'),
};


const getSteps = function (currentVersion, targetVersion) {
  // Returns array of migration functions

  let i;
  const steps = [];

  for (i = currentVersion; i !== targetVersion; i += 1) {
    if (typeof v[i].run === 'function') {
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

  let steps;

  // Load steps
  try {
    steps = getSteps(currentVersion, targetVersion);
  } catch (e) {
    return callback(e);
  }

  // Run steps in series
  asyn.eachSeries(steps, (step, next) => {
    return step(next);
  }, (err) => {
    // Finally
    return callback(err);
  });

};
