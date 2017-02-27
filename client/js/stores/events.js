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

// The cache includes s most recent events in time order, most recent first.
// Cache builds up in two directions:
// - new events via socket grow head
// - user wants to see the older ones -> tail grows
var _cache = [];

// Listening for new events.
socket.on('tresdb_event', function (ev) {
  _cache.unshift(ev);
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

  var last;

  var s = _cache.length;
  var beforeTime = null;

  // Init number of items to fetch.
  var q = 0;

  // Check cache if n most recent already exists there.
  if (s > 0) {
    if (s >= n) {
      return callback(null, _cache.slice(0, n));
    }
    // Assert: cache is not empty but does not include enough items.
    // We must request n - s items, where s is the cache size.
    // The items must be from the time before the last cached item.
    q = n - s;
    last = _cache[s - 1];
    beforeTime = last.time;
  } else {
    q = n;
  }

  // Cache does not contain enough items so we fetch them.
  fetch(q, beforeTime, function (err, items) {
    if (err) {
      return callback(err);
    }

    // Update cache. Append to array.
    // Assert: the resulting array is in correct time order, oldest last.
    _cache = _cache.concat(items);

    // Inform views or other listeners that events have been changed.
    if (items.length > 0) {
      exports.emit('events_changed');
    }

    // Now cache should contain enough items.
    // Otherwise there is not enough existing items.
    if (_cache.length < n) {
      // Return all items there is.
      return callback(null, _cache);
    }
    // Return N most recent items.
    return callback(null, _cache.slice(0, n));
  });
};
