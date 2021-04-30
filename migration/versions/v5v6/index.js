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

const db = require('georap-db');
const uploads = require('../../../server/services/uploads');
//var googlemaps = require('../../../server/services/googlemaps');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');
const entryToEvent = require('./entryToEvent');
const getShortId = require('./getShortId');
const asyn = require('async');
const clone = require('clone');

const FROM_VERSION = 5;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'next' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema(next) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, (err) => {
      if (err) {
        return next(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return next(null);
    });
  },

  function addPoints(next) {
    console.log('2. Adding property \'points\' to each user and location...');

    const coll = db.collection('users');
    const locColl = db.collection('locations');

    iter.updateEach(coll, (user, iterNext) => {
      user.points = 0;
      return iterNext(null, user);
    }, (err) => {
      if (err) {
        return next(err);
      }

      iter.updateEach(locColl, (loc, iterNext) => {
        loc.points = 0;
        return iterNext(null, loc);
      }, next);
    });
  },

  function addIsLayered(next) {
    console.log('3. Adding property \'isLayered\' to each location...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (loc, iterNext) => {
      loc.isLayered = true;
      return iterNext(null, loc);
    }, next);
  },

  function addCreator(next) {
    console.log('4. Adding property \'creator\' to each location...');

    const coll = db.collection('locations');

    const getCreatedEntry = function (loc) {
      // Returns an entry of 'created' type. Return null if no such entry.
      let i, entry;
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

    iter.updateEach(coll, (loc, iterNext) => {
      // Find creator
      const en = getCreatedEntry(loc);

      if (en === null) {
        return iterNext(new Error('location does not have a creator:' +
                                  ' ' + loc.name));
      }

      loc.creator = en.user;

      return iterNext(null, loc);
    }, next);
  },

  function addTempPlaces(next) {
    console.log('5. Adding \'places\' to each location...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);
      loc.places = [];
      return iterNext(null, loc);
    }, next);
  },

  function moveEntries(next) {
    console.log('6. Move content entries to separate entries collection ' +
                'and remove content prop from locations...');

    const coll = db.collection('locations');
    const entriesColl = db.collection('entries');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);  // Clone to avoid affecting cache

      let entries = loc.content.map((origEntry) => {
        const entry = clone(origEntry);  // Clone to avoid affecting cache
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
      entries = entries.filter((en) => {
        if (en.type === 'story') {
          if (en.data.markdown.trim() === '') {
            return false;
          }
        }
        return true;
      });

      // Remove entries in the location.
      delete loc.content;

      entriesColl.insertMany(entries, (err) => {
        if (err) {
          return iterNext(err);
        }
        // Entries inserted to new collection.
        return iterNext(null, loc);
      });

    }, next);
  },

  function createThumbnails(next) {
    console.log('7. Create thumbnail for each attachment...');

    const coll = db.collection('entries');

    iter.updateEach(coll, (origEntry, iterNext) => {
      if (origEntry.type !== 'attachment') {
        return iterNext(null, origEntry);
      }

      const newEntry = clone(origEntry);
      const file = {
        path: uploads.getAbsolutePath(newEntry.data.filepath),
        mimetype: newEntry.data.mimetype,
      };

      // Original attachment entry contains:
      //   data.filepath
      //   data.mimetype
      uploads.createThumbnail(file, (err, thumb) => {
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
    console.log('8. Create events from entries...');

    const enColl = db.collection('entries');
    const evColl = db.collection('events');

    enColl.find().toArray((err, entries) => {
      if (err) {
        return next(err);
      }

      const events = entries.map(entryToEvent);

      evColl.insertMany(events, (insertErr) => {
        if (insertErr) {
          return next(insertErr);
        }
        return next();
      });
    });
  },

  function advanceCreatedBySecond(next) {
    console.log('9. Advance location_created events to correct the order.');
    // Created event should be the earliest.

    const evColl = db.collection('events');

    const advanceBySecond = function (isostring) {
      // Return time as ISO string
      // '2017-03-03T23:39:44.000Z'
      const second = 1000;
      const ms = Date.parse(isostring) - second;
      return (new Date(ms)).toISOString();
    };

    iter.updateEach(evColl, (ev, iterNext) => {
      let copyEv;
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
    console.log('10. Remove deprecated entries...');

    // Deprecated entry types:
    // - visit
    // - created
    // - move
    // - rename
    // - tagadd
    // - tagdel

    const q = {
      type: {
        $in: ['visit', 'created', 'move', 'rename', 'tagadd', 'tagdel'],
      },
    };

    db.collection('entries').deleteMany(q, (err) => {
      if (err) {
        return next(err);
      }

      return next();
    });
  },

  function normalizeEntries(next) {
    console.log('11. Normalize remaining entries...');
    // Remaining v5 entry types are:
    // - attachment
    // - story
    //
    // Steps:
    // - merge the types
    // - remove shortId
    // - remove locationName

    const enColl = db.collection('entries');

    iter.updateEach(enColl, (origEntry, iterNext) => {
      const orig = origEntry; // alias

      const en = {
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

  asyn.series(substeps, (err) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
