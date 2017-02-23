/* eslint-disable max-statements, max-lines */

var emitter = require('component-emitter');

var locations = require('../stores/locations');
var rawEntryToEntryModel = require('./lib/rawEntryToEntryModel');
var rawEventToRawEntry = require('./lib/rawEventToRawEntry');

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
    return rawEntryToEntryModel(getRawEntry(entryId), this);
  };

  this.getEntries = function () {
    // Return entry models as an array.
    return raw.entries.map(function (rawEntry) {
      return rawEntryToEntryModel(rawEntry, self);
    });
  };

  this.getRawEvents = function () {
    return raw.events;
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

  this.createStory = function (markdown, callback) {
    // Parameters:
    //   markdown
    //     string
    //   callback
    //     function (err)
    locations.createStory(raw._id, markdown, callback);
  };

  this.createAttachment = function (form, callback) {
    // Parameters
    //   form
    //     jQuery instance of the file upload form
    //   callback
    //     function (err)
    locations.createAttachment(raw._id, form, callback);
  };

  this.createVisit = function (year, callback) {
    // Parameters:
    //   year
    //     integer or null if not given
    //   callback
    //     function (err)
    locations.createVisit(raw._id, year, callback);
  };

  this.setGeom = function (lng, lat, callback) {
    // Parameters:
    //   lng
    //     number
    //   lat
    //     number
    //   callback
    //     function (err)
    //
    // Server will emit location_geom_changed event
    locations.setGeom(raw._id, lng, lat, callback);
  };

  this.setName = function (newName, callback) {
    // Gives new name to the location and saves the change it to server.
    //
    // Parameters
    //   newName
    //     string
    //   callback
    //     function (err)
    //
    // Server will emit location_name_changed event
    locations.setName(raw._id, newName, callback);
  };

  this.setTags = function (newTags, callback) {
    // Replaces the current taglist with the new one and saves to server.
    //
    // Parameters
    //   newTags
    //     array of strings
    //   callback
    //     function (err)
    //
    // Server will emit location_tags_changed
    locations.setTags(raw._id, newTags, callback);
  };

  this.react = function (ev) {
    var rawEntry, entryModel;

    // Record new events. Assume they come in time order.
    raw.events.unshift(ev);

    // For events view
    self.emit('location_event_created', ev);

    // Update raw differently by each individual event type

    if (ev.type === 'location_name_changed') {
      raw.name = ev.data.newName;
    }

    if (ev.type === 'location_geom_changed') {
      raw.geom = ev.data.newGeom;
    }

    if (ev.type === 'location_tags_changed') {
      raw.tags = ev.data.newTags;
    }

    if (ev.type === 'location_attachment_created' ||
        ev.type === 'location_story_created' ||
        ev.type === 'location_visit_created') {
      rawEntry = rawEventToRawEntry(ev);
      raw.entries.unshift(rawEntry);
      entryModel = rawEntryToEntryModel(rawEntry, self);
      self.emit('location_entry_created', entryModel);
    }

    self.emit(ev.type, ev);
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
