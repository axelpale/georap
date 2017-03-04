/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 6
// 2. add points property to users
// 3. add creator property to locations
// 4. add places property to locations
//    - reverse geocode each location
// 5. move content entries to separate entries collection
//    - add locationId property
//    - add deleted property
//    - add temporary locationName property
//    - add data.lat and data.lng to 'created' entries
//    - also remove content property from locations
// 6. create thumbnails
// 7. create events from now separated content entries
//    - generate initial shortid name for rename entries
// 8. remove deprecated entries
// 9. normalize entries: combine entry types to single location_entry

var db = require('../../../server/services/db');
var uploads = require('../../../server/services/uploads');
//var googlemaps = require('../../../server/services/googlemaps');
var schema = require('../../lib/schema');
var iter = require('../../iter');
var entryToEvent = require('./entryToEvent');
var getShortId = require('./getShortId');
var async = require('async');
var clone = require('clone');

var FROM_VERSION = 5;
var TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with async.eachSeries in the given order.
// The parameter 'next' is function (err) that must be called in the end of
// each step.
var substeps = [

  function updateSchema(next) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, function (err) {
      if (err) {
        return next(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return next(null);
    });
  },

  function updateNames(next) {
    console.log('X. Update usernames. Dirty.');
    // Dirty hack. Instance related step to update some usernames.

    var nameMap = {
      'Rgs': 'rgs',
      'Brynkka': 'brynkka',
    };

    var coll = db.collection('locations');

    iter.updateEach(coll, function (origLoc, iterNext) {
      var loc = clone(origLoc);

      loc.content.forEach(function (entry) {
        if (entry.user in nameMap) {
          entry.user = nameMap[entry.user];
        }
      });

      return iterNext(null, loc);
    }, next);
  },

  function addPoints(next) {
    console.log('2. Adding property \'points\' to each user and location...');

    var coll = db.collection('users');
    var locColl = db.collection('locations');

    iter.updateEach(coll, function (user, iterNext) {
      user.points = 0;
      return iterNext(null, user);
    }, function (err) {
      if (err) {
        return next(err);
      }

      iter.updateEach(locColl, function (loc, iterNext) {
        loc.points = 0;
        return iterNext(null, loc);
      }, next);
    });
  },

  function addCreator(next) {
    console.log('3. Adding property \'creator\' to each location...');

    var coll = db.collection('locations');

    var getCreatedEntry = function (loc) {
      // Returns an entry of 'created' type. Return null if no such entry.
      var i, entry;
      for (i = 0; i < loc.content.length; i += 1) {
        if (loc.content[i].type === 'created') {
          entry = loc.content[i];
          break;
        }
      }

      if (entry) {
        return entry;
      }
      return null;
    };

    iter.updateEach(coll, function (loc, iterNext) {
      // Find creator
      var en = getCreatedEntry(loc);

      if (en === null) {
        return iterNext(new Error('location does not have a creator:' +
                                  ' ' + loc.name));
      }

      loc.creator = en.user;

      return iterNext(null, loc);
    }, next);
  },

  // function addPlaces(next) {
  //   console.log('4. Adding \'places\' to each location...');
  //
  //   var coll = db.collection('locations');
  //
  //   iter.updateEach(coll, function (loc, iterNext) {
  //     var latlng = [loc.geom.coordinates[1], loc.geom.coordinates[0]];
  //     googlemaps.reverseGeocode(latlng, function (err, places) {
  //       if (err) {
  //         return iterNext(err);
  //       }
  //
  //       loc.places = places;
  //
  //       return iterNext(null, loc);
  //     });
  //   }, next);
  // },

  function addTempPlaces(next) {
    console.log('4. Adding \'places\' to each location...');

    var coll = db.collection('locations');

    iter.updateEach(coll, function (origLoc, iterNext) {
      var loc = clone(origLoc);
      loc.places = [];
      return iterNext(null, loc);
    }, next);
  },

  function moveEntries(next) {
    console.log('5. Move content entries to separate entries collection ' +
                'and remove content prop from locations...');

    var coll = db.collection('locations');
    var entriesColl = db.collection('entries');

    iter.updateEach(coll, function (origLoc, iterNext) {
      var loc = clone(origLoc);  // Clone to avoid affecting cache

      var entries = loc.content.map(function (origEntry) {
        var entry = clone(origEntry);  // Clone to avoid affecting cache
        entry.shortId = entry._id;
        delete entry._id;

        entry.locationId = loc._id;
        entry.locationName = loc.name;
        entry.deleted = false;

        // Store some data that can be taken only from location.
        if (entry.type === 'created') {
          if (entry.time > '2016-11-01') {
            // The names were given in the creation with Xitrux Locator
            entry.locationName = getShortId(loc._id, entry.shortId);
          }
          entry.data.lat = loc.geom.coordinates[1];
          entry.data.lng = loc.geom.coordinates[0];
        }

        // Replace empty location names with shortids
        if (entry.type === 'rename') {
          if (entry.data.oldName === '') {
            entry.locationName = getShortId(loc._id, entry.shortId);
            entry.data.oldName = getShortId(loc._id, entry.shortId);
          }
        }

        return entry;
      });

      // Remove stories with empty content.
      entries = entries.filter(function (en) {
        if (en.type === 'story') {
          if (en.data.markdown.trim() === '') {
            return false;
          }
        }
        return true;
      });

      // Remove entries in the location.
      delete loc.content;

      entriesColl.insertMany(entries, function (err) {
        if (err) {
          return iterNext(err);
        }
        // Entries inserted to new collection.
        return iterNext(null, loc);
      });

    }, next);
  },

  function createThumbnails(next) {
    console.log('6. Create thumbnail for each attachment...');

    var coll = db.collection('entries');

    iter.updateEach(coll, function (origEntry, iterNext) {
      if (origEntry.type !== 'attachment') {
        return iterNext(null, origEntry);
      }

      var newEntry = clone(origEntry);
      var file = {
        path: uploads.getAbsolutePath(newEntry.data.filepath),
        mimetype: newEntry.data.mimetype,
      };

      // Original attachment entry contains:
      //   data.filepath
      //   data.mimetype
      uploads.createThumbnail(file, function (err, thumb) {
        if (err) {
          return iterNext(err);
        }

        newEntry.data.thumbfilepath = uploads.getRelativePath(thumb.path);
        newEntry.data.thumbmimetype = thumb.mimetype;

        return iterNext(null, newEntry);
      });

    }, next);
  },

  function createEvents(next) {
    console.log('7. Create events from entries...');

    var enColl = db.collection('entries');
    var evColl = db.collection('events');

    enColl.find().toArray(function (err, entries) {
      if (err) {
        return next(err);
      }

      var events = entries.map(entryToEvent);

      evColl.insertMany(events, function (insertErr) {
        if (insertErr) {
          return next(insertErr);
        }
        return next();
      });
    });
  },

  function advanceCreatedBySecond(next) {
    console.log('X. Advance location_created events to correct the order.');
    // Created event should be the earliest.

    var evColl = db.collection('events');

    var advanceBySecond = function (isostring) {
      // Return time as ISO string
      // '2017-03-03T23:39:44.000Z'
      var second = 1000;
      var ms = Date.parse(isostring) - second;
      return (new Date(ms)).toISOString();
    };

    iter.updateEach(evColl, function (ev, iterNext) {
      var copyEv;
      if (ev.type === 'location_created') {
        copyEv = clone(ev);
        copyEv.time = advanceBySecond(copyEv.time);
        return iterNext(null, copyEv);
      }
      // No need to update
      return iterNext(null, null);
    }, next);
  },

  function removeDeprecatedEntries(next) {
    console.log('8. Remove deprecated entries...');

    // Deprecated entry types:
    // - visit
    // - created
    // - move
    // - rename
    // - tagadd
    // - tagdel

    var q = {
      type: {
        $in: ['visit', 'created', 'move', 'rename', 'tagadd', 'tagdel'],
      },
    };

    db.collection('entries').deleteMany(q, function (err) {
      if (err) {
        return next(err);
      }

      return next();
    });
  },

  function normalizeEntries(next) {
    console.log('9. Normalize remaining entries...');
    // Remaining v5 entry types are:
    // - attachment
    // - story
    //
    // Steps:
    // - merge the types
    // - remove shortId
    // - remove locationName

    var enColl = db.collection('entries');

    iter.updateEach(enColl, function (origEntry, iterNext) {
      var orig = origEntry; // alias

      var en = {
        _id: orig._id,
        type: 'location_entry',
        user: orig.user,
        time: orig.time,
        locationId: orig.locationId,
        // note missing locationName
        deleted: orig.deleted,
        data: {
          markdown: null,
          isVisit: false,
          filepath: null,
          mimetype: null,
          thumbfilepath: null,
          thumbmimetype: null,
        },
      };

      if (orig.type === 'attachment') {
        en.data.filepath = orig.data.filepath;
        en.data.mimetype = orig.data.mimetype;
        en.data.thumbfilepath = orig.data.thumbfilepath;
        en.data.thumbmimetype = orig.data.thumbmimetype;
        return iterNext(null, en);
      }

      if (orig.type === 'story') {
        en.data.markdown = orig.data.markdown;
        return iterNext(null, en);
      }

      return iterNext(new Error('unknown entry type: ' + orig.type));
    }, next);
  },

];

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  async.series(substeps, function (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
