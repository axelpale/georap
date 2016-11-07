/* global google */

var Emitter = require('component-emitter');

var getBoundsDiagonal = function (bounds) {
  // A google.maps.LatLngBounds diagonal distance in meters.

  // Geometry library is required.
  // See http://stackoverflow.com/a/4874741
  var api = google.maps.geometry.spherical;

  // Corners
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();

  // Meters between corners
  var diagonal = api.computeDistanceBetween(ne, sw);

  return diagonal;
};


module.exports = function (socket, auth) {

  Emitter(this);
  var self = this;

  // We will listen the map for changes.
  var listener = null;

  // Public methods

  this.addOne = function (geom, callback) {
    // Create single location at geom and store it to server.

    var payload = {
      token: auth.getToken(),
      geom: geom,
    };

    socket.emit('locations/addOne', payload, function (response) {
      if (response.hasOwnProperty('success')) {
        return callback(null, response.success);
      }

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      }

      throw new Error('invalid server response');
    });
  };

  this.fetchOne = function (locationId, callback) {
    // Get single location from server

    var payload = {
      token: auth.getToken(),
      locationId: locationId,
    };

    socket.emit('locations/getOne', payload, function (response) {
      if (response.hasOwnProperty('success')) {
        return callback(null, response.success);
      }

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      }

      throw new Error('invalid server response');
    });
  };

  this.fetchAll = function (callback) {
    // Get all locations from server.

    var payload = { token: auth.getToken() };

    socket.emit('locations/get', payload, function (response) {
      if (response.hasOwnProperty('locations')) {
        // Successful fetch.
        // Inform about new data.
        return callback(null, response.locations);
      }  // else

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      } // else

      throw new Error('invalid server response');
    });
  };

  this.fetchWithin = function (center, radius, zoomLevel, callback) {
    // Parameters
    //   center
    //     google.maps.LatLng instance
    //   radius
    //     number of meters
    //   zoomLevel
    //     only locations on this layer and above will be fetched.
    //   callback
    //     function (err, locations)

    // API requires MongoDB legacy coordinate format
    var legacyCenter = [center.lng(), center.lat()];

    var payload = {
      token: auth.getToken(),
      center: legacyCenter,
      radius: radius,
      layer: zoomLevel,
    };

    socket.emit('locations/getWithin', payload, function (response) {
      if (response.hasOwnProperty('locations')) {
        return callback(null, response.locations);
      }  // else

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      }  // else

      throw new Error('invalid server response');
    });
  };

  this.rename = function (locationId, newName, callback) {
    // Rename a location
    //
    // Parameters:
    //   locationId
    //     object id compatible string
    //   newName
    //     string
    //   callback
    //     function (err, updatedLoc)

    var payload = {
      token: auth.getToken(),
      locationId: locationId,
      newName: newName,
    };

    socket.emit('locations/rename', payload, function (response) {
      if (response.hasOwnProperty('success')) {
        self.emit('rename', response.success);
        return callback(null, response.success);
      }

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      }

      throw new Error('invalid server response');
    });
  };


  this.listen = function (mapController) {

    var map = mapController.getMap();

    // Prevent duplicate listeners.
    if (listener !== null) {
      return;
    }

    // Each idle, fetch a new set of locations.
    listener = map.addListener('idle', function () {

      // console.log('map idle, fetchNearest');

      var center = map.getCenter();
      var bounds = map.getBounds();
      var radius = Math.ceil(getBoundsDiagonal(bounds) / 2);
      var zoomLevel = map.getZoom();

      self.fetchWithin(center, radius, zoomLevel, function (err, locs) {
        if (err) {
          return console.error(err);
        }  // else

        // locs.forEach(function (loc) {
        //   console.log(loc.name, loc.neighborsAvgDist);
        // });
        console.log('fetched', locs.length, 'locations');

        mapController.locations.update(locs);
      });

    });
  };

  this.unlisten = function () {
    google.maps.event.removeListener(listener);
    listener = null;
  };
};
