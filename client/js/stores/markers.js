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
      ev.type === 'location_name_changed') {
    exports.emit(ev.type, ev);
  }
});

// Public methods

exports.getFiltered = function (params, callback) {
  // Parameters:
  //   params
  //     text
  //       string
  //   callback
  //     function (err, markerLocations)

  $.ajax({
    url: '/api/markers/search',
    method: 'GET',
    data: {
      text: params.text,
    },
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (rawMarkers) {
      return callback(null, rawMarkers);
    },
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(errorThrown);
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
      return callback(errorThrown);
    },
  });
};
