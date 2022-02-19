var request = require('../lib/request');

module.exports = function (params, callback) {
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

  return request.getJSON({
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
