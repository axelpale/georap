/* eslint-disable max-statements, max-lines */

var extend = require('extend');
var clone = require('clone');
var emitter = require('component-emitter');

var api = require('../connection/api');
var locations = require('../stores/locations');
var defaultRawLocation = require('./lib/defaultRawLocation');
var sortEntries = require('./lib/sortEntries');
var toEntry = require('./lib/toEntryModel');

module.exports = function (rawLoc) {
  // Usage:
  //   var l = new Location(fullLocFromServer);
  //
  // Parameters:
  //   rawLoc
  //     Optional location properties that override the default.

  // Init

  emitter(this);
  var self = this;

  // Deep extend the default location.
  var loc = clone(defaultRawLocation);
  if (typeof rawLoc === 'object') {
    extend(true, loc, rawLoc);
  }

  // Private methods

  var getRawEntry = function (id) {
    // Return a raw entry with given id
    var i;
    for (i = 0; i < loc.content.length; i += 1) {
      if (loc.content[i]._id === id) {
        return loc.content[i];
      }
    }
    return null;
  };

  var hasRawEntry = function (id) {
    // Return true if an entry with given id exists
    return getRawEntry(id) !== null;
  };

  // var addRawEntry = function (rawEntry) {
  //   // Add raw entry locally to location.
  //   loc.content.push(rawEntry);
  // };

  var removeRawEntry = function (id) {
    // Remove locally a raw entry with the given id.

    // Find index
    var i, index;
    index = -1;
    for (i = 0; i < loc.content.length; i += 1) {
      if (loc.content[i]._id === id) {
        index = i;
        break;
      }
    }

    // Already removed if not found, thus return
    if (index === -1) {
      return;
    }

    // Remove in place
    loc.content.splice(index, 1);
  };



  // Public Getters

  this.getAgeInHours = function () {
    // Finds the created event and returns hours between the creation and now.
    // Returns 0 if no such entry;
    var ent = this.getCreatedEntry();

    if (!ent) {
      return 0;
    }

    var MS = 1000;
    var S = 60;
    var M = 60;
    var now = Date.now();
    var backThen = (new Date(ent.time)).getTime();
    var diffMs = now - backThen;
    var diffHours = diffMs / (M * S * MS);

    return diffHours;
  };

  this.getCreator = function () {
    // Return the username of the creator of the location.
    // Return '' if not known.
    var ent = this.getCreatedEntry();

    if (!ent) {
      return '';
    }
    return ent.user;
  };

  this.getId = function () {
    return loc._id;
  };

  this.getName = function () {
    return loc.name;
  };

  this.getGeom = function () {
    // Return GeoJSON
    return loc.geom;
  };

  this.getLongitude = function () {
    return loc.geom.coordinates[0];
  };

  this.getLatitude = function () {
    return loc.geom.coordinates[1];
  };

  this.getEntry = function (entryId) {
    // Return
    //   Content entry model or null if not found.
    if (!hasRawEntry(entryId)) {
      return null;
    }
    return toEntry(getRawEntry(entryId), this);
  };

  this.getCreatedEntry = function () {
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

  this.getEntries = function () {
    // Return content entry models as an array.
    return loc.content.map(function (rawEntry) {
      return toEntry(rawEntry, self);
    });
  };

  this.getEntriesInTimeOrder = function () {
    // Shallow clone the content array
    var tempContent = loc.content.slice(0);
    sortEntries(tempContent);
    return tempContent.map(function (rawEntry) {
      return toEntry(rawEntry, self);
    });
  };

  this.getMarkerLocation = function () {
    return {
      _id: loc._id,
      name: loc.name,
      geom: loc.geom,
      tags: loc.tags,
      layer: loc.layer,
    };
  };

  this.getTags = function () {
    // Return array of strings
    return loc.tags;
  };

  this.hasTag = function (tag) {
    return (loc.tags.indexOf(tag) > -1);
  };


  // Public Mutators

  this.addStory = function (markdown, callback) {
    // Parameters:
    //   markdown
    //     string
    //   callback
    //     function (err)
    locations.addStory(loc._id, markdown, callback);
  };

  this.addAttachment = function (form, callback) {
    // Parameters
    //   form
    //     jQuery instance of the file upload form
    //   callback
    //     function (err)
    locations.addAttachment(loc._id, form, callback);
  };

  this.addVisit = function (year, callback) {
    // Parameters:
    //   year
    //     integer or null if not given
    //   callback
    //     function (err)
    locations.addVisit(loc._id, year, callback);
  };

  this.removeEntry = function (entryId, callback) {
    // Remove entry from database.
    //
    // Parameters:
    //   entryId
    //   callback
    //     function (err)
    var removedEntry;

    if (hasRawEntry(entryId)) {

      removedEntry = getRawEntry(entryId);
      removeRawEntry(entryId);

      this.save(function (err) {
        if (err) {
          loc.content.push(removedEntry);
          return callback(err);
        }

        self.emit('entry_removed', { entryId: removedEntry._id });
        return callback();
      });
    } else {
      // If already removed
      return callback();
    }
  };

  this.setGeom = function (lng, lat, callback) {
    // Parameters:
    //   lng
    //     number
    //   lat
    //     number
    //   callback
    //     function (err)
    locations.setGeom(loc._id, lng, lat, function (err) {
      if (err) {
        return callback(err);
      }

      // Update coords
      loc.geom.coordinates[0] = lng;
      loc.geom.coordinates[1] = lat;
      self.emit('geom_changed');

      return callback();
    });
  };

  this.setName = function (newName, callback) {
    // Gives new name to the location and saves the change it to server.
    //
    // Parameters
    //   newName
    //     string
    //   callback
    //     function (err)

    locations.setName(loc._id, newName, function (err) {
      if (err) {
        return callback(err);
      }

      loc.name = newName;
      self.emit('name_changed');

      return callback();
    });
  };

  this.setTags = function (newTags, callback) {
    // Replaces the current taglist with the new one and saves to server.
    //
    // Parameters
    //   newTags
    //     array of strings
    //   callback
    //     function (err)
    locations.setTags(loc._id, newTags, function (err) {
      if (err) {
        return callback(err);
      }

      loc.tags = newTags;
      self.emit('tags_changed');

      return callback();
    });
  };

  this.save = function (callback) {
    // Stores the location to the backend.
    // Used mainly by the location model itself.
    //
    // Parameters:
    //   callback
    //     function (err)
    api.request('locations/put', { location: loc }, function (err, savedLoc) {
      if (err) {
        return callback(err);
      }
      // Store _id. Does nothing if only updated and not created.
      loc._id = savedLoc._id;
      // Inform about the successful update.
      self.emit('saved');
      return callback();
    });
  };

  this.remove = function (callback) {
    locations.removeOne(loc._id, function (err) {
      if (err) {
        return callback(err);
      }
      self.emit('removed', self);
      return callback();
    });
  };
};
