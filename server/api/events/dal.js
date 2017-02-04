var db = require('../../services/db');
var io = require('../../services/io');

exports.createLocationCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId, location id
  //     lat
  //     lng
  //       float
  //     username
  //       string
  //   callback
  //     function (err);

  var newEvent = {
    type: 'location_created',
    user: params.username,
    time: (new Date()).toISOString(),
    locationId: params.locationId,
    data: {
      lat: params.lat,
      lng: params.lng,
    },
  };

  var coll = db.get().collection('events');

  coll.insertOne(newEvent, function (err, result) {
    if (err) {
      return callback(err);
    }

    newEvent._id = result.insertedId;

    io.get().emit('location_created', newEvent);
    return callback();
  });
};

exports.getRecent = function (n, page, callback) {
  // Parameters
  //   n
  //     number of events to return
  //   page
  //     page number. 0 = first page. Return range [n * page, n * (page + 1)[
  //     from the array of all events, ordered by time, most recent first
  //   callback
  //     function (err, events)

  var coll = db.get().collection('events');

  coll.find({}).sort({ time: 1 }).toArray(function (err, docs) {
    if (err) {
      return callback(err);
    }

    return callback(null, docs);
  });
};
