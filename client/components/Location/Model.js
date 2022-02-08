/* eslint-disable max-statements, max-lines */

var emitter = require('component-emitter');
var models = require('georap-models');
var locations = georap.stores.locations;

module.exports = function (rawLoc) {
  // Usage:
  //   var l = new Location(fullLocFromServer);
  //
  // Parameters:
  //   rawLoc
  //     An extended location object
  //

  // Init
  var self = this;
  emitter(self);

  // Bind

  locations.on('location_event', function (ev) {
    // Update rawLoc accordingly.
    // Forget events of other locations
    if (ev.locationId !== rawLoc._id) {
      return;
    }

    if (ev.type === 'location_name_changed') {
      rawLoc.name = ev.data.newName;
      self.emit(ev.type);
    }

    if (ev.type === 'location_geom_changed') {
      rawLoc.geom = ev.data.newGeom;
      rawLoc.altGeom = ev.data.newAltGeom;
      self.emit(ev.type);
    }

    if (ev.type === 'location_status_changed') {
      rawLoc.status = ev.data.newStatus;
      self.emit(ev.type);
    }

    if (ev.type === 'location_type_changed') {
      rawLoc.type = ev.data.newType;
      self.emit(ev.type);
    }

    // Emit removed so that view can unbind.
    if (ev.type === 'location_removed') {
      self.emit('location_removed');
    }
  });


  // Private methods


  // Public Getters

  self.getRaw = function () {
    return rawLoc;
  };

  self.getAltGeom = function (system) {
    // Return coordinates in the given coordinate systems.
    // Only systems in rawLoc.altGeom are available.
    return rawLoc.altGeom[system];
  };

  self.getAltGeoms = function () {
    return rawLoc.altGeom;
  };

  self.getCreator = function () {
    // Return the username of the creator of the location.
    // Return '' if not known.
    return rawLoc.user;
  };

  self.getId = function () {
    return rawLoc._id;
  };

  self.getName = function () {
    return rawLoc.name;
  };

  self.getGeom = function () {
    // Return GeoJSON { coordinates: [<lng>, <lat>] }
    return rawLoc.geom;
  };

  self.getLongitude = function () {
    return rawLoc.geom.coordinates[0];
  };

  self.getLatitude = function () {
    return rawLoc.geom.coordinates[1];
  };

  self.getMarkerLocation = function () {
    return models.location.toMarkerLocation(rawLoc);
  };

  self.getPlaces = function () {
    // Return array of strings
    return rawLoc.places;
  };

  self.getStatus = function () {
    // Return string
    return rawLoc.status;
  };

  self.getType = function () {
    // Return string
    return rawLoc.type;
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
    locations.setGeom(rawLoc._id, lng, lat, callback);
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
    locations.setName(rawLoc._id, newName, callback);
  };

  self.setStatus = function (newStatus, callback) {
    // Replaces the current status and saves to server.
    //
    // Parameters
    //   newStatus
    //     string
    //   callback
    //     function (err)
    //
    // Server will emit location_status_changed
    locations.setStatus(rawLoc._id, newStatus, callback);
  };

  self.setType = function (newType, callback) {
    // Replaces the current type and saves to server.
    //
    // Parameters
    //   newType
    //     string
    //   callback
    //     function (err)
    //
    // Server will emit location_type_changed
    locations.setType(rawLoc._id, newType, callback);
  };

  self.remove = function (callback) {
    locations.removeOne(rawLoc._id, callback);
  };
};
