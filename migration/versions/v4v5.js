
// In this version increase:
// - Create _id for each content entry
// - Remove neighborsAvgDist property

const iter = require('../iter');
const schema = require('../lib/schema');
const db = require('tresdb-db');

const FROM_VERSION = 4;
const TO_VERSION = FROM_VERSION + 1;

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  // 1. Schema version tag update
  console.log('Setting schema version tag...');

  schema.setVersion(TO_VERSION, (err) => {
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
    console.log('Filling null visit years.');
    console.log('Deleting locations\' locatorId property.');
    console.log('Changing tag "heavy-industry" to "factory".');

    const locsColl = db.collection('locations');

    iter.updateEach(locsColl, (loc, next) => {

      // Some locatorId's might still exist
      delete loc.locatorId;

      // Update tags
      loc.tags = loc.tags.map((tag) => {
        if (tag === 'heavy-industry') {
          return 'factory';
        }
        return tag;
      });

      loc.content = loc.content.map((entry) => {
        let year, key, filename, filepath;
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

        if (entry.type === 'visit') {
          year = (new Date(entry.time)).getFullYear();
          // Update null to year
          if (entry.data.year === null) {
            entry.data.year = year;
          }
        }

        return entry;
      });

      return next(null, loc);
    }, (err2) => {

      if (err2) {
        return callback(err2);
      }  // else

      console.log('Locations successfully transformed.');

      console.log('### Step successful ###');

      return callback();
    });
  });
};
