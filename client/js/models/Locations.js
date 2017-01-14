
var emitter = require('component-emitter');
var shortid = require('shortid');
var LocationModel = require('./Location');

module.exports = function (api, account) {
  // Usage:
  //   var locations = new models.Locations(api, account)
  //
  // Parameters:
  //   api
  //     an api.Api instance
  //   account
  //     a models.Account
  emitter(this);
  var self = this;

  // To inform views (especially Map) about changes in locations,
  // we listen the previously created/retrieved location. This surveillance
  // should cover all the locations in the cache but as we do not have a cache,
  // the easiest solution is to listen only the last retrieved location.
  var listenForChanges = (function () {
    var loc2listen = null;

    var handler = function () {
      self.emit('location_changed', loc2listen);
    };

    return function listen(location) {
      // Parameters
      //   location
      //     a models.Location
      if (loc2listen !== null) {
        loc2listen.off('saved', handler);
        loc2listen = null;
      }

      loc2listen = location;
      loc2listen.on('saved', handler);
    };
  }());

  this.create = function (geom, callback) {
    // Create a new location on the server.
    //
    // Parameters:
    //   geom
    //     GeoJSON Point
    //   callback
    //     function (err, createdLocation)

    var rawLoc = {
      name: '',
      geom: geom,
      deleted: false,
      tags: [],
      content: [{
        _id: shortid.generate(),
        type: 'created',
        user: account.getName(),
        time: (new Date()).toISOString(),
        data: {},
      }],
      layer: 1,  // dummy
    };

    var payload = {
      location: rawLoc,
    };

    api.request('locations/put', payload, function (err, newRawLoc) {
      if (err) {
        return callback(err);
      }

      var newLoc = new LocationModel(api, account, newRawLoc);

      // Emit changes of this location until next loc in focus.
      listenForChanges(newLoc);

      // Inform others that new location has been created.
      self.emit('location_changed', newLoc);

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
    var payload = { location: { _id: id } };

    api.request('locations/get', payload, function (err, rawLoc) {
      if (err) {
        return callback(err);
      }

      var newLoc = new LocationModel(api, account, rawLoc);

      listenForChanges(newLoc);

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
    //     function (err, markerLocations)

    // API requires MongoDB legacy coordinate format
    var legacyCenter = [center.lng(), center.lat()];

    var payload = {
      center: legacyCenter,
      radius: radius,
      layer: zoomLevel,
    };

    api.request('locations/getMarkersWithin', payload, callback);
  };

};
