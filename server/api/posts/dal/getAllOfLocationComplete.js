const getManyComplete = require('./getManyComplete');

module.exports = (locationId, callback) => {
  // Get all non-deleted entries of a location with their attachments.
  //
  // Parameters:
  //   locationId
  //     object id
  //   callback
  //     function (err, entries)
  //
  return getManyComplete({
    locationId: locationId,
    deleted: false,
  }, {
    skip: 0,
    limit: 100,
  }, callback);
};
