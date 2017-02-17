/* eslint-disable max-statements, max-lines */

var emitter = require('component-emitter');

var locations = require('../stores/locations');
var sortEntries = require('./lib/sortEntries');
var toEntryModel = require('./lib/toEntryModel');

module.exports = function (raw) {
  // Usage:
  //   var l = new Location(fullLocFromServer);
  //
  // Parameters:
  //   raw
  //     Optional location properties that override the default.

  // Init
  emitter(this);
  var self = this;


  // Private methods

  var getRawEntry = function (id) {
    // Return a raw entry with given id
    var i;
    for (i = 0; i < raw.entries.length; i += 1) {
      if (raw.entries[i]._id === id) {
        return raw.entries[i];
      }
    }
    return null;
  };

  var hasRawEntry = function (id) {
    // Return true if an entry with given id exists
    return getRawEntry(id) !== null;
  };

  // var removeRawEntry = function (id) {
  //   // Remove locally a raw entry with the given id.
  //
  //   // Find index
  //   var i, index;
  //   index = -1;
  //   for (i = 0; i < raw.entries.length; i += 1) {
  //     if (raw.entries[i]._id === id) {
  //       index = i;
  //       break;
  //     }
  //   }
  //
  //   // Already removed if not found, thus return
  //   if (index === -1) {
  //     return;
  //   }
  //
  //   // Remove in place
  //   raw.entries.splice(index, 1);
  // };



  // Public Getters

  this.getCreator = function () {
    // Return the username of the creator of the location.
    // Return '' if not known.
    return raw.creator;
  };

  this.getId = function () {
    return raw._id;
  };

  this.getName = function () {
    return raw.name;
  };

  this.getGeom = function () {
    // Return GeoJSON
    return raw.geom;
  };

  this.getLongitude = function () {
    return raw.geom.coordinates[0];
  };

  this.getLatitude = function () {
    return raw.geom.coordinates[1];
  };

  this.getEntry = function (entryId) {
    // Return
    //   Content entry model or null if not found.
    if (!hasRawEntry(entryId)) {
      return null;
    }
    return toEntryModel(getRawEntry(entryId), this);
  };

  this.getEntries = function () {
    // Return entry models as an array.
    return raw.entries.map(function (rawEntry) {
      return toEntryModel(rawEntry, self);
    });
  };

  this.getEntriesInTimeOrder = function () {
    // Shallow clone the entries array
    var tempContent = raw.entries.slice(0);
    sortEntries(tempContent);
    return tempContent.map(function (rawEntry) {
      return toEntryModel(rawEntry, self);
    });
  };

  this.getMarkerLocation = function () {
    return {
      _id: raw._id,
      name: raw.name,
      geom: raw.geom,
      tags: raw.tags,
      layer: raw.layer,
    };
  };

  this.getTags = function () {
    // Return array of strings
    return raw.tags;
  };

  this.hasTag = function (tag) {
    return (raw.tags.indexOf(tag) > -1);
  };


  // Public Mutators

  this.addStory = function (markdown, callback) {
    // Parameters:
    //   markdown
    //     string
    //   callback
    //     function (err)
    locations.addStory(raw._id, markdown, callback);
  };

  this.addAttachment = function (form, callback) {
    // Parameters
    //   form
    //     jQuery instance of the file upload form
    //   callback
    //     function (err)
    locations.addAttachment(raw._id, form, callback);
  };

  this.addVisit = function (year, callback) {
    // Parameters:
    //   year
    //     integer or null if not given
    //   callback
    //     function (err)
    locations.addVisit(raw._id, year, callback);
  };

  this.setGeom = function (lng, lat, callback) {
    // Parameters:
    //   lng
    //     number
    //   lat
    //     number
    //   callback
    //     function (err)
    locations.setGeom(raw._id, lng, lat, function (err) {
      if (err) {
        return callback(err);
      }

      // Update coords
      raw.geom.coordinates[0] = lng;
      raw.geom.coordinates[1] = lat;
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

    locations.setName(raw._id, newName, function (err) {
      if (err) {
        return callback(err);
      }

      raw.name = newName;
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
    locations.setTags(raw._id, newTags, function (err) {
      if (err) {
        return callback(err);
      }

      raw.tags = newTags;
      self.emit('tags_changed');

      return callback();
    });
  };

  this.remove = function (callback) {
    locations.removeOne(raw._id, function (err) {
      if (err) {
        return callback(err);
      }
      self.emit('removed', self);
      return callback();
    });
  };
};
