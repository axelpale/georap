const getManyComplete = require('./getManyComplete');

module.exports = (locationId, callback) => {
  // Get all non-deleted posts of a location with their attachments.
  //
  // Parameters:
  //   locationId
  //     object id
  //   callback
  //     function (err, posts)
  //
  return getManyComplete({
    locationId: locationId,
    deleted: false,
  }, {
    skip: 0,
    limit: 100,
  }, callback);
};
