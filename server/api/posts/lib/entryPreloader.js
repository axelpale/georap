// URL parser middleware
// Fetches entry and its location and places them
// to req.location and req.entry for further use.

const status = require('http-status-codes');
const db = require('georap-db');

module.exports = function (req, res, next) {
  const stringId = req.params.entryId;

  try {
    req.entryId = db.id(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  db.collection('entries').aggregate([
    {
      $match: {
        _id: req.entryId,
      },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: 'locations',
        localField: 'locationId',
        foreignField: '_id',
        as: 'location',
      },
    },
    {
      // Take location out of array
      $unwind: '$location',
    },
  ]).toArray((err, results) => {
    if (err) {
      return next(err);
    }

    if (results.length < 1) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.entry = results[0];
    req.location = req.entry.location;

    // Keep the entry object original because it might
    // be stored with the events.
    delete req.entry.location;

    // Mark ownership for capability checking
    if (req.user && req.user.name === req.entry.user) {
      req.isOwner = true;
    } else {
      req.isOwner = false;
    }

    return next();
  });
};
