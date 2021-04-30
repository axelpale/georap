const db = require('georap-db');

module.exports = (locationId, callback) => {
  // Get all non-deleted entries of a location, most recent first.
  //
  // Parameters
  //   locationId
  //     object id
  //   callback
  //     function (err, entries)

  const coll = db.collection('entries');
  const q = {
    locationId: locationId,
    deleted: false,
  };
  const opt = { sort: { time: -1 } };

  return coll.find(q, opt).toArray(callback);
};
