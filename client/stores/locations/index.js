/* eslint-disable max-lines */
var socket = require('../../connection/socket');
var request = require('../lib/request');
var emitter = require('component-emitter');

// Init
emitter(exports);

socket.on('georap_event', function (ev) {
  // Emit all location events. Allow hooking to all location events or
  // specific event type e.g. location_created, needed by main menu to
  // determine when creation is successful.
  if (ev.type.startsWith('location_')) {
    exports.emit('location_event', ev);
    exports.emit(ev.type, ev);
  }
});

var getJSON = request.getJSON;
var postFile = request.postFile;

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

exports.create = require('./create');
exports.createWithName = require('./createWithName');
exports.getOne = require('./getOne');
exports.getAttachments = require('./getAttachments');
exports.getPosts = require('./getPosts');
exports.getEvents = require('./getEvents');
exports.getLatest = require('./getLatest');

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

exports.importBatch = require('./importBatch');
exports.search = require('./search');
exports.setGeom = require('./setGeom');
exports.setName = require('./setName');
exports.setStatus = require('./setStatus');
exports.setType = require('./setType');
exports.setThumbnail = require('./setThumbnail');
exports.removeOne = require('./removeOne');
