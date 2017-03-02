
// In this version increase:
// - set schema version to 6
// - add points property to users
// - add creator property to locations
// - add places property to locations
//   - reverse geocode each location
// - generate initial shortid name for new locations
// - convert content entries to entries and events
//   - remove content property from locations
// - convert entry types to single location_entry

var db = require('../../../server/services/db');
var googlemaps = require('../../../server/services/googlemaps');
var schema = require('../../lib/schema');
var iter = require('../../iter');
var async = require('async');
var _ = require('lodash');

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

  function addPoints(next) {
    console.log('2. Adding property \'points\' to each user...');

    var coll = db.collection('users');

    iter.updateEach(coll, function (user, iterNext) {
      user.points = 0;
      return iterNext(null, user);
    }, next);
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

  function addPlaces(next) {
    console.log('4. Adding \'places\' to each location...');

    var coll = db.collection('locations');

    iter.updateEach(coll, function (loc, iterNext) {
      var latlng = [loc.geom.coordinates[1], loc.geom.coordinates[0]];
      googlemaps.reverseGeocode(latlng, function (err, places) {
        if (err) {
          return iterNext(err);
        }

        loc.places = places;

        return iterNext(null, loc);
      });
    }, next);
  },

  function addCreator(next) {
    console.log('5. Convert content entries to events and entries...');

    var coll = db.collection('locations');
    var eventsColl = db.collection('events');
    var entriesColl = db.collection('entries');

    iter.updateEach(coll, function (loc, iterNext) {
      // Magic
      // - created => event 'location_created'
      // - ...
      // Dig from master branch!

      return iterNext(null, loc);
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
