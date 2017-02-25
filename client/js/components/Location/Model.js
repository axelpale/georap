/* eslint-disable max-statements, max-lines */

var emitter = require('component-emitter');

var locations = require('../../stores/locations');
var EventsModel = require('./Events/Model');
var EntriesModel = require('./Entries/Model');

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

  var _events = new EventsModel(raw.events, this);
  var _entries = new EntriesModel(raw.entries, this);

  // Bind

  locations.on('location_event', function (ev) {
    // Forget events of other locations
    if (ev.locationId !== raw._id) {
      return;
    }

    // For events model
    self.emit('location_event_created', ev);

    // For entries model
    if (ev.type.startsWith('location_attachment_') ||
        ev.type.startsWith('location_story_') ||
        ev.type.startsWith('location_visit_')) {
      self.emit('location_entry_event', ev);
    }

    if (ev.type === 'location_name_changed') {
      raw.name = ev.data.newName;
      self.emit(ev.type);
    }

    if (ev.type === 'location_geom_changed') {
      raw.geom = ev.data.newGeom;
      self.emit(ev.type);
    }

    if (ev.type === 'location_tags_changed') {
      raw.tags = ev.data.newTags;
      self.emit(ev.type);
    }

    // Emit removed so that view can unbind.
    if (ev.type === 'location_removed') {
      self.emit('location_removed');
    }
  });


  // Private methods


  // Public Getters

  // this.hasEntry = function (entryId) {
  //   this.getEntry(entryId) !== null;
  // };

  this.getCreator = function () {
    // TODO ensure creator is everywhere.
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

  this.getEntries = function () {
    // Return EntriesModel.
    return _entries;
  };

  this.getEvents = function () {
    // Return EventsModel
    return _events;
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

  //this.react = function (ev) {
    // var rawEntry, entryModel;
    //
    // // Record new events. Assume they come in time order.
    // raw.events.unshift(ev);
    //
    // // For events view
    // self.emit('location_event_created', ev);

    // Update raw differently by each individual event type
    //
    // if (ev.type === 'location_name_changed') {
    //   raw.name = ev.data.newName;
    // }
    //
    // if (ev.type === 'location_geom_changed') {
    //   raw.geom = ev.data.newGeom;
    // }
    //
    // if (ev.type === 'location_tags_changed') {
    //   raw.tags = ev.data.newTags;
    // }

    // if (ev.type === 'location_story_changed') {
    //   entryModel = self.getEntry(ev.data.entryId);
    //   // Null if not found
    //   if (entryModel) {
    //     entryModel.react(ev);
    //   }
    // }

    // Create entry from events
    // if (ev.type === 'location_attachment_created' ||
    //     ev.type === 'location_story_created' ||
    //     ev.type === 'location_visit_created') {
    //   rawEntry = rawEventToRawEntry(ev);
    //   raw.entries.unshift(rawEntry);
    //   entryModel = rawEntryToEntryModel(rawEntry, self);
    //   _entryModels.unshift(entryModel);
    //   self.emit('location_entry_created', entryModel);
    // }

    // if (ev.type === 'location_attachment_removed' ||
    //     ev.type === 'location_story_removed' ||
    //     ev.type === 'location_visit_removed') {
    //   entryModel = self.getEntry(ev.data.entryId);
    //   // Null if not found
    //   if (entryModel) {
    //     entryModel.react(ev);
    //   }
    //
    // }

    // // Emit model removed so that view can unbind.
    // if (ev.type === 'location_removed') {
    //   self.emit('removed');
    // }
    //
    // self.emit(ev.type, ev);
  //};

  this.remove = function (callback) {
    locations.removeOne(raw._id, callback);
  };
};
