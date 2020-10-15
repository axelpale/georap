
var db = require('tresdb-db');
var dal = require('./dal');
var lib = require('./lib');

exports.run = function (callback) {
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

  var loColl = db.collection('locations');
  var enColl = db.collection('entries');

  var q = { deleted: false };
  var loCursor = loColl.find(q);

  dal.forEach(loCursor, function (loc, next) {

    var eq = {
      locationId: loc._id,
      deleted: false,
    };

    enColl.find(eq).toArray(function (err, entries) {
      if (err) {
        return next(err);
      }

      var creator = [lib.normalize(loc.creator)];

      var entryTexts = entries.map(function (en) {
        var r = en.user;

        if (en.data.markdown) {
          r += ' ' + lib.normalize(en.data.markdown);
        }

        return r;
      });

      var classification = [loc.status, loc.type];
      var places = loc.places;

      var names = lib.wordheads(lib.normalize(loc.name));

      // Divide to primary and secondary text data
      // Matches to primary have greater weight in the sorting of results.
      var parts1 = names.concat(classification);
      var parts2 = creator.concat(places, entryTexts);

      var dump1 = parts1.join(' ');
      var dump2 = parts2.join(' ');

      var u = {
        $set: {
          text1: dump1,
          text2: dump2,
        },
      };

      loColl.updateOne({ _id: loc._id }, u, function (err2) {
        if (err2) {
          return next(err2);
        }
        return next();
      });
    });
  }, function afterForEach(err) {

    if (err) {
      return callback(err);
    }

    var msg = 'search: Search index for each location ' +
              'combined and stored.';
    console.log(msg);

    return callback();
  });

};
