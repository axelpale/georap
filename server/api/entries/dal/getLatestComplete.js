const getManyComplete = require('./getManyComplete');

module.exports = (range, callback) => {
  // Get latest entries with their attachments and urls completed.
  //
  // Parameters:
  //   range
  //     skip
  //     limit
  //   callback
  //     function (err, entries)
  //
  return getManyComplete({
    deleted: false,
  }, {
    skip: range.skip,
    limit: range.limit,
    withLocations: true,
  }, callback);
};
