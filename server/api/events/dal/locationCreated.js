const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId, location id
  //     locationName
  //     lat
  //     lng
  //       float
  //     username
  //       string
  //     time
  //       timestamp used to create the location
  //   callback
  //     function (err);
  //
  const newEvent = {
    type: 'location_created',
    user: params.username,
    time: params.time,
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      lat: params.lat,
      lng: params.lng,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
