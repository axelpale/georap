var socket = require('../connection/socket');
var emitter = require('component-emitter');
var request = require('./lib/request');

// Init

emitter(exports);

// Bind

socket.on('georap_event', function (ev) {
  // Emit marker events so that map knows how to respond.
  if (ev.type === 'location_created' ||
      ev.type === 'location_removed' ||
      ev.type === 'location_geom_changed' ||
      ev.type === 'location_status_changed' ||
      ev.type === 'location_type_changed' ||
      ev.type === 'location_name_changed' ||
      ev.type === 'location_entry_created' ||
      ev.type === 'location_entry_changed' ||
      ev.type === 'location_entry_removed') {
    exports.emit(ev.type, ev);
  }
});

// Public methods

exports.getFiltered = function (params, callback) {
  // Parameters:
  //   params
  //     creator
  //       optional string. Default is 'anyone'.
  //     deleted
  //       optional boolean. Include only deleted. Default is false.
  //     limit
  //       optional integer. Default is 50.
  //       Number of locations to include.
  //     order
  //       optional string, following values are possible:
  //         'rel', relevance, default if text is used
  //         'az', alphabetical, default if text is not used
  //         'za', alphabetical
  //         'newest', newest first
  //         'oldest', oldest first
  //     skip
  //       optional integer. Default is 0.
  //     text
  //       optional string. A free-form search term.
  //   callback
  //     function (err, markerLocations)
  //       err, with properties
  //         message, equals to status text, 'error' on connection error
  //         code
  //           0 on connection error
  //           200 on success
  //           500 on internal server error
  //           etc
  //
  request.getJSON({
    url: '/api/markers/search',
    data: params,
  }, function (err, rawMarkers) {
    return callback(err, rawMarkers);
  });
};

exports.getWithin = function (center, radius, zoomLevel, callback) {
  // Parameters
  //   center
  //     google.maps.LatLng instance
  //   radius
  //     number of meters
  //   zoomLevel
  //     only locations on this layer and above will be fetched.
  //   callback
  //     function (err, markerLocations)
  //
  var data = {
    lat: center.lat(),
    lng: center.lng(),
    radius: radius,
    layer: zoomLevel,
  };

  request.getJSON({
    url: '/api/markers',
    data: data,
  }, function (err, rawMarkers) {
    return callback(err, rawMarkers);
  });
};

exports.getFilteredWithin = function (opts, callback) {
  //
  var data = {
    east: opts.east,
    north: opts.north,
    south: opts.south,
    west: opts.west,
    status: opts.status,
    type: opts.type,
    layer: opts.layer,
    groupRadius: opts.groupRadius,
  };

  request.getJSON({
    url: '/api/markers/filtered',
    data: data,
  }, function (err, rawMarkers) {
    return callback(err, rawMarkers);
  });
};
