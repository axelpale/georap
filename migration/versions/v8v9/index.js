/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 9
// 2. replace tags property with status and type for each location

const db = require('georap-db');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');
const tagdog = require('./tagdog');
const asyn = require('async');
const clone = require('clone');

const FROM_VERSION = 8;
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

  function addStatusAndType(next) {
    console.log('2. Replace tags with status and type properties...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);
      let tags = loc.tags;

      // Upgrade old tags before tagdog, to match valid tags in config.
      tags = loc.tags.map(tagdog.upgradeLegacyTag);

      const statusType = tagdog.tagsToStatusType(tags);
      loc.status = statusType.status;
      loc.type = statusType.type;
      delete loc.tags;

      return iterNext(null, loc);
    }, next);
  },

  function replaceLegacyTags(next) {
    console.log('3. Replace legacy tags');

    const coll = db.collection('events');

    iter.updateEach(coll, (origEv, iterNext) => {
      if (origEv.type === 'location_tags_changed') {
        const newEv = clone(origEv);
        newEv.data.newTags = newEv.data.newTags.map(tagdog.upgradeLegacyTag);
        newEv.data.oldTags = newEv.data.oldTags.map(tagdog.upgradeLegacyTag);
        return iterNext(null, newEv);
      } // else

      // Skip this doc
      return iterNext(null, null);
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
