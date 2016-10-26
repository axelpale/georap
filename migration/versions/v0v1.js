// This module specifies migration from schema v0 to v1

exports.run = function (db, callback) {
  // Parameters
  //   db
  //     Monk db instance
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v0 to v1 ###');
  console.log('### Step successful ###');

  // No changes needed.
  return callback(null);
};
