/* eslint-disable max-lines */

var socket = require('../connection/socket');
var validateCoords = require('./lib/validateCoords');
var request = require('./lib/request');
var account = require('./account');
var emitter = require('component-emitter');
var locationStatuses = tresdb.config.locationStatuses;
var locationTypes = tresdb.config.locationTypes;

// Init
emitter(exports);

socket.on('tresdb_event', function (ev) {
  // Emit all location events. Allow hooking to all location events or
  // specific event type e.g. location_created, needed by main menu to
  // determine when creation is successful.
  if (ev.type.startsWith('location_')) {
    exports.emit('location_event', ev);
    exports.emit(ev.type, ev);
  }
});

var getJSON = request.getJSON;
var postJSON = request.postJSON;
var postFile = request.postFile;
var deleteJSON = request.deleteJSON;

var state = {
  selectedLocationId: null,
  selectedLocation: null,
};

// Public local state methods

exports.selectLocation = function (loc) {
  // Parameters
  //   locId, a LocationModel
  state = Object.assign({}, state, {
    selectedLocationId: loc.getId(),
    selectedLocation: loc,
  });
  exports.emit('updated', state);
};

exports.deselectLocation = function (locId) {
  // Unselect the given location.
  // NOTE Does not nullify the selection if another location is selected,
  // NOTE to ensure correct behavior if async call order sometimes changes,
  // NOTE e.g. in case where two LocationViews are opened one after another.
  if (state.selectedLocationId === locId) {
    state.selectedLocationId = null;
    state.selectedLocation = null;
    exports.emit('updated', state);
  }
};

exports.isSelected = function (locId) {
  return state.selectedLocationId === locId;
};


// Public API methods

exports.changeEntry = function (locationId, entryId, form, callback) {
  // Parameters:
  //   locationId
  //   entryId
  //   form
  //     jQuery instance of the file upload form.
  //   callback
  //     function (err)
  return postFile({
    url: '/api/locations/' + locationId + '/entries/' + entryId,
    form: form,
  }, callback);
};

exports.createEntry = function (id, form, callback) {
  // Parameters
  //   id
  //     location id
  //   form
  //     jQuery instance of the file upload form
  //   callback
  //     function (err)

  return postFile({
    url: '/api/locations/' + id + '/entries',
    form: form,
  }, callback);
};

exports.create = function (geom, callback) {
  // Create a new location on the server.
  //
  // Parameters:
  //   geom
  //     GeoJSON Point
  //   callback
  //     function (err, rawLoc)

  return postJSON({
    url: '/api/locations',
    data: {
      lat: geom.coordinates[1],
      lng: geom.coordinates[0],
    },
  }, function (err, rawLoc) {
    if (err) {
      return callback(err);
    }

    if (rawLoc === 'TOO_CLOSE') {
      return callback(new Error('TOO_CLOSE'));
    }

    return callback(null, rawLoc);
  });
};

exports.get = function (id, callback) {
  // Fetch a location from server and return a models.Location instance.
  // Will call back with error if not found.
  //
  // Parameters:
  //   id
  //     ID string
  //   callback
  //     function (err, location)
  //

  $.ajax({
    url: '/api/locations/' + id,
    method: 'GET',
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (rawLoc) {
      return callback(null, rawLoc);
    },
    error: function (jqxhr, status, statusMessage) {
      return callback(new Error(statusMessage));
    },
  });
};

exports.importFile = function (form, callback) {
  // Parameters
  //   form
  //     jQuery instance of the file upload form
  //   callback
  //     function (err)

  return postFile({
    url: '/api/locations/import',
    form: form,
  }, callback);
};

exports.getBatch = function (batchId, callback) {
  return getJSON('/api/locations/import/' + batchId, callback);
};

exports.getOutcome = function (batchId, callback) {
  return getJSON('/api/locations/import/' + batchId + '/outcome', callback);
};

exports.importBatch = function (data, callback) {
  // Parameters
  //   data
  //     { batchId: string, indices: Array}
  //   callback
  //     function (err)
  //
  if (!data.hasOwnProperty('batchId') || !data.hasOwnProperty('indices')) {
    throw new Error('Invalid argument: ' + JSON.stringify(data));
  }

  return postJSON({
    url: '/api/locations/import/' + data.batchId,
    data: data,
  }, callback);
};

this.setGeom = function (id, lng, lat, callback) {
  // Parameters:
  //   id
  //     location id
  //   lng
  //     number
  //   lat
  //     number
  //   callback
  //     function (err)

  if (!validateCoords.isValidLongitude(lng)) {
    return callback(new Error('Invalid coordinate'));
  }
  if (!validateCoords.isValidLatitude(lat)) {
    return callback(new Error('Invalid coordinate'));
  }

  return postJSON({
    url: '/api/locations/' + id + '/geom',
    data: {
      lat: lat,
      lng: lng,
    },
  }, callback);
};

exports.setName = function (id, newName, callback) {
  // Gives new name to the location and saves the change it to server.
  //
  // Parameters
  //   newName
  //     string
  //   callback
  //     function (err)

  return postJSON({
    url: '/api/locations/' + id + '/name',
    data: { newName: newName },
  }, callback);
};

this.setStatus = function (id, newStatus, callback) {
  // Replaces the current status and saves to server.
  //
  // Parameters
  //   id
  //     location id
  //   newStatus
  //     string
  //   callback
  //     function (err)

  // Validate to catch bugs.
  if (locationStatuses.indexOf(newStatus) < 0) {
    throw new Error('Invalid location status string: ' + newStatus);
  }

  return postJSON({
    url: '/api/locations/' + id + '/status',
    data: { status: newStatus },
  }, callback);
};

this.setType = function (id, newType, callback) {
  // Replaces the current type and saves to server.
  //
  // Parameters
  //   id
  //     location id
  //   newType
  //     string
  //   callback
  //     function (err)

  // Validate to catch bugs.
  if (locationTypes.indexOf(newType) < 0) {
    throw new Error('Invalid location type string: ' + newType);
  }

  return postJSON({
    url: '/api/locations/' + id + '/type',
    data: { type: newType },
  }, callback);
};

exports.createComment = function (locationId, entryId, message, callback) {
  // Parameters:
  //   locationId
  //   entryId
  //   message
  //     comment content string
  //   callback
  //     function (err)

  if (typeof message !== 'string' || message.length === 0) {
    return callback(new Error('Invalid message'));
  }

  return postJSON({
    url: '/api/locations/' + locationId + '/entries/' + entryId + '/comments',
    data: {
      message: message,
    },
  }, callback);
};

exports.changeComment = function (params, callback) {
  var locationId = params.locationId;
  var entryId = params.entryId;
  var commentId = params.commentId;
  var newMessage = params.newMessage;

  var entryUrl = '/api/locations/' + locationId + '/entries/' + entryId;
  return postJSON({
    url: entryUrl + '/comments/' + commentId,
    data: {
      newMessage: newMessage,
    },
  }, callback);
};

exports.removeComment = function (locationId, entryId, commentId, callback) {
  var entryUrl = '/api/locations/' + locationId + '/entries/' + entryId;
  return deleteJSON({
    url: entryUrl + '/comments/' + commentId,
    data: {},
  }, callback);
};

exports.removeEntry = function (locationId, entryId, callback) {
  return deleteJSON({
    url: '/api/locations/' + locationId + '/entries/' + entryId,
    data: {},
  }, callback);
};

exports.removeOne = function (id, callback) {
  // Parameters
  //   id
  //   callback
  //     function (err)

  $.ajax({
    url: '/api/locations/' + id,
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, statusMessage) {
      return callback(new Error(statusMessage));
    },
  });
};
