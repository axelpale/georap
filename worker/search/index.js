
const db = require('tresdb-db');
const searchDal = require('./dal');
const lib = require('./lib');

exports.run = (callback) => {
  // Create text field for each location. This field is indexed with
  // mongo's full text search and used for search.
  //
  // Collect together:
  //   location names and parts
  //   entries
  //     text content
  //     filename
  //   status
  //   type
  //   creators
  //

  const loColl = db.collection('locations');
  const enColl = db.collection('entries');

  const q = { deleted: false };
  const loCursor = loColl.find(q);

  searchDal.forEach(loCursor, (loc, next) => {

    const eq = {
      locationId: loc._id,
      deleted: false,
    };

    enColl.find(eq).toArray((err, entries) => {
      if (err) {
        return next(err);
      }

      const creator = [lib.normalize(loc.creator)];

      const entryTexts = entries.map((en) => {
        let r = en.user;

        if (en.data.markdown) {
          r += ' ' + lib.normalize(en.data.markdown);
        }

        return r;
      });

      const classification = [loc.status, loc.type];
      const places = loc.places;

      const names = lib.wordheads(lib.normalize(loc.name));

      // Divide to primary and secondary text data
      // Matches to primary have greater weight in the sorting of results.
      const parts1 = names.concat(classification);
      const parts2 = creator.concat(places, entryTexts);

      const dump1 = parts1.join(' ');
      const dump2 = parts2.join(' ');

      const u = {
        $set: {
          text1: dump1,
          text2: dump2,
        },
      };

      loColl.updateOne({ _id: loc._id }, u, (err2) => {
        if (err2) {
          return next(err2);
        }
        return next();
      });
    });
  }, (err) => {
    // Finally
    if (err) {
      return callback(err);
    }

    const msg = 'search: Search index for each location ' +
              'combined and stored.';
    console.log(msg);

    return callback();
  });

};
