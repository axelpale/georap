var socket = require('../connection/socket');
var account = require('./account');
var emitter = require('component-emitter');

// Init

emitter(exports);

// Bind

socket.on('tresdb_event', function (ev) {
  // Emit marker events so that map knows how to respond.
  if (ev.type === 'location_created' ||
      ev.type === 'location_removed' ||
      ev.type === 'location_geom_changed' ||
      ev.type === 'location_tags_changed' ||
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

  $.ajax({
    url: '/api/markers/search',
    method: 'GET',
    data: params,
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (rawMarkers) {
      return callback(null, rawMarkers);
    },
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(new Error(errorThrown));
    },
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

  $.ajax({
    url: '/api/markers',
    method: 'GET',
    data: {
      lat: center.lat(),
      lng: center.lng(),
      radius: radius,
      layer: zoomLevel,
    },
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (rawMarkers) {
      return callback(null, rawMarkers);
    },
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(new Error(errorThrown));
    },
  });
};
