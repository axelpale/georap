const db = require('georap-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId, location id
  //     locationName
  //       string
  //     username
  //       string
  //   callback
  //     function (err);

  const newEvent = {
    type: 'location_removed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {},
  };

  lib.insertAndEmit(newEvent, callback);
};
