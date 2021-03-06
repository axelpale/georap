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
// var deleteJSON = request.deleteJSON;

var state = {
  selectedLocationId: null,
  selectedMarkerLocation: null, // data of the selected loc
};

// Public local state methods

exports.selectLocation = function (mloc) {
  // Parameters
  //   mloc, a MarkerLocation
  //
  state = Object.assign({}, state, {
    selectedLocationId: mloc._id,
    selectedMarkerLocation: mloc,
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
    state.selectedMarkerLocation = null;
    exports.emit('updated', state);
  }
};

exports.deselectAll = function () {
  state = Object.assign({}, state, {
    selectedLocationId: null,
    selectedMarkerLocation: null,
  });
  exports.emit('updated', state);
};

exports.isSelected = function (locId) {
  return state.selectedLocationId === locId;
};


// Public API methods

exports.create = function (geom, callback) {
  // Create a new location on the server.
  //
  // Parameters:
  //   geom
  //     GeoJSON Point
  //   callback
  //     function (err, rawLoc)
  //

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

exports.createWithName = function (params, callback) {
  // Create a new location on the server with name.
  //
  // Parameters:
  //   params:
  //     geometry
  //       GeoJSON Point
  //     name
  //       string
  //   callback
  //     function (err, rawLoc)
  //

  var geom = params.geometry;
  var lat = geom.coordinates[1];
  var lng = geom.coordinates[0];
  var name = params.name;

  return postJSON({
    url: '/api/locations',
    data: {
      lat: lat,
      lng: lng,
      name: name,
    },
  }, function (err, rawLoc) {
    if (err) {
      return callback(err);
    }

    // An error not related to the connection or request.
    if (rawLoc === 'TOO_CLOSE') {
      return callback(new Error('TOO_CLOSE'));
    }

    return callback(null, rawLoc);
  });
};

exports.getOne = function (id, callback) {
  // Fetch a location from server and return a location object.
  // Will call back with error if not found.
  //
  // Parameters:
  //   id
  //     ID string
  //   callback
  //     function (err, location)
  //
  return getJSON({
    url: '/api/locations/' + id,
  }, callback);
};

exports.getAttachments = function (params, callback) {
  // Fetch all attachments related to the location.
  // The result can be used for example for the location thumbnail palette.
  //
  // Parameters:
  //   params
  //     locationId
  //     imagesOnly
  //       optional boolean, default false
  //   callback
  //     function (err, { attachments }) where
  //       attachments
  //         array of attachment objects
  //
  params = Object.assign({
    imagesOnly: false,
  }, params);

  return getJSON({
    url: '/api/locations/' + params.locationId + '/attachments',
    data: {
      imagesOnly: params.imagesOnly,
    },
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};

exports.getEntries = function (params, callback) {
  // Fetch a set of entries of the location, most recent first.
  //
  // Parameters:
  //   params
  //     locationId
  //     skip
  //       integer
  //     limit
  //       integer
  //   callback
  //     function (err, { entries, more }) where
  //       entries
  //         array of entry objects
  //       more
  //         boolean. True if there are still more entries after skip+limit.
  //
  return getJSON({
    url: '/api/locations/' + params.locationId + '/entries',
    data: {
      skip: params.skip,
      limit: params.limit,
    },
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};

exports.getLatest = function (params, callback) {
  // Fetch recent locations from server and return an array of locations objs.
  // Will call back with error if not found.
  //
  // Parameters:
  //   params
  //     skip: skip first locations
  //     limit: number of locations to fetch
  //   callback
  //     function (err, locations)
  //

  return getJSON({
    url: '/api/locations/',
    data: { // url params
      skip: params.skip,
      limit: params.limit,
    },
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    // Result is { locations, locationCount }
    return callback(null, result);
  });
};

exports.importFile = function (form, callback) {
  // Parameters
  //   form
  //     jQuery instance of the file upload form
  //   callback
  //     function (err)
  //
  return postFile({
    url: '/api/locations/import',
    form: form,
  }, callback);
};

exports.getBatch = function (batchId, callback) {
  return getJSON({
    url: '/api/locations/import/' + batchId,
  }, callback);
};

exports.getOutcome = function (batchId, callback) {
  return getJSON({
    url: '/api/locations/import/' + batchId + '/outcome',
  }, callback);
};

exports.importBatch = function (data, callback) {
  // Parameters
  //   data
  //     { batchId: string, indices: Array}
  //   callback
  //     function (err)
  //
  if (!('batchId' in data) || !('indices' in data)) {
    throw new Error('Invalid argument: ' + JSON.stringify(data));
  }

  return postJSON({
    url: '/api/locations/import/' + data.batchId,
    data: data,
  }, callback);
};

exports.search = function (params, callback) {
  // Search for non-deleted locations
  return getJSON({
    url: '/api/locations/search',
    data: {
      phrase: params.phrase,
      skip: params.skip,
      limit: params.limit,
    },
  }, callback);
};

exports.setGeom = function (id, lng, lat, callback) {
  // Parameters:
  //   id
  //     location id
  //   lng
  //     number
  //   lat
  //     number
  //   callback
  //     function (err)
  //
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
  //
  return postJSON({
    url: '/api/locations/' + id + '/name',
    data: { newName: newName },
  }, callback);
};

exports.setStatus = function (id, newStatus, callback) {
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

exports.setType = function (id, newType, callback) {
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

exports.setThumbnail = function (id, attachmentKey, callback) {
  // Replaces the current thumbnail.
  //
  // Parameters
  //   id
  //     location id
  //   attachmentKey
  //     string, attachment key of the new thumbnail
  //   callback
  //     function (err)

  // Validate to catch bugs.
  if (typeof attachmentKey !== 'string' || attachmentKey.length === 0) {
    throw new Error('Invalid attachmentKey: ' + attachmentKey);
  }

  return postJSON({
    url: '/api/locations/' + id + '/thumbnail',
    data: { attachmentKey: attachmentKey },
  }, callback);
};

exports.removeOne = function (id, callback) {
  // Delete a location
  //
  // Parameters
  //   id
  //   callback
  //     function (err)
  //
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
