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
  var self = this;
  emitter(self);

  var _events = new EventsModel(raw.events, self);
  var _entries = new EntriesModel(raw.entries, self);

  // Bind

  locations.on('location_event', function (ev) {
    // Forget events of other locations
    if (ev.locationId !== raw._id) {
      return;
    }

    // For events model
    self.emit('location_event_created', ev);

    // For entries model
    if (ev.type.startsWith('location_entry_')) {
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

  self.getAltGeom = function () {
    // Return an array of coordinates in alternative coordinate systems.
    return raw.altGeom;
  };

  self.getCreator = function () {
    // TODO ensure creator is everywhere.
    // Return the username of the creator of the location.
    // Return '' if not known.
    return raw.creator;
  };

  self.getId = function () {
    return raw._id;
  };

  self.getName = function () {
    return raw.name;
  };

  self.getGeom = function () {
    // Return GeoJSON
    return raw.geom;
  };

  self.getLongitude = function () {
    return raw.geom.coordinates[0];
  };

  self.getLatitude = function () {
    return raw.geom.coordinates[1];
  };

  self.getEntries = function () {
    // Return EntriesModel.
    return _entries;
  };

  self.getEvents = function () {
    // Return EventsModel
    return _events;
  };

  self.getMarkerLocation = function () {
    return {
      _id: raw._id,
      name: raw.name,
      geom: raw.geom,
      tags: raw.tags,
      layer: raw.layer,
    };
  };

  self.getPlaces = function () {
    // Return array of strings
    return raw.places;
  };

  self.getTags = function () {
    // Return array of strings
    return raw.tags;
  };

  self.hasTag = function (tag) {
    return (raw.tags.indexOf(tag) > -1);
  };


  // Public Mutators

  self.setGeom = function (lng, lat, callback) {
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

  self.setName = function (newName, callback) {
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

  self.setTags = function (newTags, callback) {
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

  self.remove = function (callback) {
    locations.removeOne(raw._id, callback);
  };
};
