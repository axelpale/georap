
// In this version increase:
// - Create _id for each content entry
// - Remove neighborsAvgDist property

var iter = require('../iter');
var schema = require('../lib/schema');

var FROM_VERSION = 4;
var TO_VERSION = FROM_VERSION + 1;

exports.run = function (db, callback) {
  // Parameters
  //   db
  //     Monk db instance
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  // 1. Schema version tag update
  console.log('Setting schema version tag...');

  var configColl = db.collection('config');

  schema.setVersion(configColl, TO_VERSION, function (err) {
    if (err) {
      return callback(err);
    }  // else

    console.log('Schema version tag created.');

    // 2. Transform locations' attachment schema.
    // Example of an old entry.data structure:
    //   {
    //     "filename" : "Kolkos palaa1.jpg",
    //     "key" : "b0996a695484abf21797d35bc2ea164c",
    //     "mimetype" : "image/jpeg"
    //   }
    // New structure:
    //   {
    //     "filepath" : "2017/B1clUV0Le/quote-proverb-fast-far-alone.jpg",
    //     "mimetype" : "image/jpeg"
    //   }
    console.log('Transforming locations\' attachments data schema:');
    console.log('  combine year, key, and filename to filepath.');

    var locsColl = db.collection('locations');

    iter.updateEach(locsColl, function (loc, next) {

      loc.content = loc.content.map(function (entry) {
        var year, key, filename, filepath;
        if (entry.type === 'attachment') {
          // Old
          year = (new Date(entry.time)).getFullYear().toString();
          key = entry.data.key;
          filename = entry.data.filename;
          // New filepath
          filepath = year + '/' + key + '/' + filename;
          // Update
          entry.data.filepath = filepath;
          delete entry.data.filename;
          delete entry.data.key;
        }
        return entry;
      });

      return next(loc);
    }, function (err2) {

      if (err2) {
        return callback(err2);
      }  // else

      console.log('Locations successfully transformed.');

      console.log('### Step successful ###');

      return callback();
    });
  });
};
