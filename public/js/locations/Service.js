/* global google */

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

  var self = this;

  // We will listen the map for changes.
  var listener = null;

  // Public methods

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

  this.fetchWithin = function (center, radius, callback) {
    // Parameters
    //   center
    //     google.maps.LatLng instance
    //   radius
    //     number of meters
    //   callback
    //     function (err, locations)

    // API requires MongoDB legacy coordinate format
    var legacyCenter = [center.lng(), center.lat()];

    var payload = {
      token: auth.getToken(),
      center: legacyCenter,
      radius: radius,
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

      self.fetchWithin(center, radius, function (err, locs) {
        if (err) {
          return console.error(err);
        }  // else

        // locs.forEach(function (loc) {
        //   console.log(loc.name, loc.neighborsAvgDist);
        // });
        console.log('fetched', locs.length, 'locations');

        mapController.locations.removeAll();
        mapController.locations.add(locs);
      });

    });
  };

  this.unlisten = function () {
    google.maps.event.removeListener(listener);
    listener = null;
  };
};
