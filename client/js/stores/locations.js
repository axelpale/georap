/* eslint-disable max-lines */

var emitter = require('component-emitter');

var socket = require('../connection/socket');
var account = require('./account');
var tags = require('./tags');
var validateCoords = require('./lib/validateCoords');
var Location = require('../components/Location/Model');

// Init
emitter(exports);

socket.on('tresdb_event', function (ev) {
  if (ev.type.startsWith('location_')) {
    exports.emit('location_event', ev);
  }
});

// To inform views (especially Map) about changes in locations,
// we listen the previously created/retrieved location. This surveillance
// should cover all the locations in the cache but as we do not have a cache,
// the easiest solution is to listen only the last retrieved location.
var listenForChanges = (function () {
  var loc2listen = null;

  var savedHandler = function () {
    exports.emit('location_changed', loc2listen);
  };

  var removeHandler = function () {
    exports.emit('location_removed', loc2listen);
    loc2listen = null;
  };

  // socket.on('tresdb_event', function (ev) {
  //   if (loc2listen !== null) {
  //     if (ev.locationId === loc2listen.getId()) {
  //       loc2listen.react(ev);
  //     }
  //   }
  // });

  return function listen(location) {
    // Parameters
    //   location
    //     a models.Location

    if (loc2listen !== null) {
      loc2listen.off('saved', savedHandler);
      loc2listen.off('removed', removeHandler);
      loc2listen = null;
    }

    loc2listen = location;
    loc2listen.on('saved', savedHandler);
    loc2listen.on('removed', removeHandler);
  };
}());

var postJSON = function (params, callback) {
  // General JSON POST AJAX request.
  //
  // Parameters:
  //   params
  //     url
  //     data
  //   callback
  //     function (err)
  $.ajax({
    url: params.url,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(params.data),
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (responseData) {
      return callback(null, responseData);
    },
    error: function (jqxhr, status, err) {
      console.error(err);
      return callback(err);
    },
  });
};

var deleteJSON = function (params, callback) {
  // General JSON DELETE AJAX request.
  //
  // Parameters:
  //   params
  //     url
  //     data
  //   callback
  //     function (err, jsonResponse)
  $.ajax({
    url: params.url,
    type: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify(params.data),
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (responseData) {
      return callback(null, responseData);
    },
    error: function (jqxhr, status, err) {
      console.error(err);
      return callback(err);
    },
  });
};



this.changeStory = function (locationId, entryId, newMarkdown, callback) {
  // Parameters:
  //   locationId
  //   entryId
  //   newMarkdown
  //   callback
  //     function (err)
  return postJSON({
    url: '/api/locations/' + locationId + '/stories/' + entryId,
    data: { newMarkdown: newMarkdown.trim() },
  }, callback);
};

this.createAttachment = function (id, form, callback) {
  // Parameters
  //   id
  //     location id
  //   form
  //     jQuery instance of the file upload form
  //   callback
  //     function (err)

  var formData = new FormData(form[0]);

  // Send. The contentType must be false, otherwise a Boundary header
  // becomes missing and multer on the server side throws an error about it.
  // The browser will attach the correct headers to the request.
  //
  // Official JWT auth header is used:
  //   Authorization: Bearer mF_9.B5f-4.1JqM
  // For details, see https://tools.ietf.org/html/rfc6750#section-2.1
  $.ajax({
    url: '/api/locations/' + id + '/attachments',
    type: 'POST',
    contentType: false,
    data: formData,
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    processData: false,
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, err) {
      console.log('Upload error');
      console.log(status, err);
      return callback(err);
    },
  });
};

exports.createStory = function (id, markdown, callback) {
  // Parameters:
  //   id
  //     location id
  //   markdown
  //     string
  //   callback
  //     function (err)

  if (typeof markdown !== 'string') {
    throw new Error('invalid story markdown type: ' + (typeof markdown));
  }

  return postJSON({
    url: '/api/locations/' + id + '/stories',
    data: {
      markdown: markdown.trim(),
    },
  }, callback);
};

exports.createVisit = function (id, year, callback) {
  // Parameters:
  //   id
  //     location id
  //   year
  //     integer or null if not given
  //   callback
  //     function (err)

  if (typeof year !== 'number') {
    throw new Error('invalid visit year type: ' + (typeof year));
  }

  return postJSON({
    url: '/api/locations/' + id + '/visits',
    data: { year: year },
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

  postJSON({
    url: '/api/locations',
    data: {
      lat: geom.coordinates[1],
      lng: geom.coordinates[0],
    },
  }, callback);
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

      var loc = new Location(rawLoc);
      listenForChanges(loc);

      return callback(null, loc);
    },
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(errorThrown);
    },
  });
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

this.setTags = function (id, newTags, callback) {
  // Replaces the current taglist with the new one and saves to server.
  //
  // Parameters
  //   id
  //     location id
  //   newTags
  //     array of strings
  //   callback
  //     function (err)

  // Validate
  var i, t;
  for (i = 0; i < newTags.length; i += 1) {
    t = newTags[i];
    if (!tags.isValidTag(t)) {
      throw new Error('unknown tag: ' + t);
    }
  }

  return postJSON({
    url: '/api/locations/' + id + '/tags',
    data: { tags: newTags },
  }, callback);
};

exports.removeAttachment = function (locationId, entryId, callback) {
  return deleteJSON({
    url: '/api/locations/' + locationId + '/attachments/' + entryId,
    data: {},
  }, callback);
};

exports.removeStory = function (locationId, entryId, callback) {
  return deleteJSON({
    url: '/api/locations/' + locationId + '/stories/' + entryId,
    data: {},
  }, callback);
};

exports.removeVisit = function (locationId, entryId, callback) {
  return deleteJSON({
    url: '/api/locations/' + locationId + '/visits/' + entryId,
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
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(errorThrown);
    },
  });
};
