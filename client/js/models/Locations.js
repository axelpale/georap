// Usage:
//   var locationsModel = new models.Locations(api, auth)
//

var LocationModel = require('./Location');

module.exports = function (api, auth) {

  this.create = function (geom, callback) {
    // Create a new location on the server.
    //
    // Parameters:
    //   geom
    //     GeoJSON Point
    //   callback
    //     function (err, createdLocation)

    api.request('locations/addOne', { geom: geom }, function (err, loc) {
      if (err) {
        return callback(err);
      }

      var newLoc = new LocationModel(loc, api, auth);

      return callback(null, newLoc);
    });
  };

  this.get = function (id, callback) {
    // Fetch a location from server and return a models.Location instance.
    // Will call back with error if not found.
    //
    // Parameters:
    //   id
    //     Object ID string
    //   callback
    //     function (err, location)
    //

    api.request('locations/getOne', { locationId: id }, function (err, loc) {
      if (err) {
        return callback(err);
      }

      var newLoc = new LocationModel(loc, api, auth);

      return callback(null, newLoc);
    });
  };

  this.getMarkersWithin = function (center, radius, zoomLevel, callback) {
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
      center: legacyCenter,
      radius: radius,
      layer: zoomLevel,
    };

    api.request('locations/getWithin', payload, callback);
  };

};
