// Event store. Caching and automatically updating.
//
// Init:
//   var events = require('./events');
//
// Call:
//   events.getRecent(n, function (err, nEvs) { ... });
//
// Listen if events change:
//   events.on('events_changed', function () {
//     events.getRecent(n, function (err, nEvs) {
//       ...
//     });
//   });

var emitter = require('component-emitter');

var socket = require('../connection/socket');
var account = require('./account');

emitter(exports);

// Listen for new events and inform views that
// new events are available.
socket.on('tresdb_event', function () {
  exports.emit('events_changed');
});

var fetch = function (n, beforeTime, callback) {
  // Parameters:
  //   n
  //     max number of events to fetch
  //   beforeTime
  //     fetch only events before this time. Null = no time limit.
  //   callback
  //     function (err, arrayEvents)
  //
  $.ajax({
    url: '/api/events',
    method: 'GET',
    data: {
      n: n,
      beforeTime: beforeTime,  // can be null, meaning "before now"
    },
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (data) {
      // Parameters:
      //   data
      //     array of events, most recent first
      return callback(null, data);
    },
    error: function (jqxhr, statusCode, statusMessage) {
      return callback(new Error(statusMessage));
    },
  });
};

exports.getRecent = function (n, callback) {
  // Parameters:
  //   n
  //     integer
  //   callback
  //     function (err, events)
  //       Parameters:
  //         err
  //         events
  //           array, most recent event first

  var beforeTime = null; // null equals now

  fetch(n, beforeTime, function (err, items) {
    if (err) {
      return callback(err);
    }
    return callback(null, items);
  });
};
