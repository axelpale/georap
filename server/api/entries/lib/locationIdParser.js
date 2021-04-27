// Fetches location from req.body.locationId
const status = require('http-status-codes');
const db = require('tresdb-db');

module.exports = function (req, res, next) {
  const locationIdString = req.body.locationId;

  if (!locationIdString) {
    return res.status(status.BAD_REQUEST).send('locationId is required');
  }

  let locationId;
  try {
    locationId = db.id(locationIdString);
  } catch (e) {
    // This id might become available in future.
    // Therefore NOT_FOUND instead of BAD_REQUEST
    return res.sendStatus(status.NOT_FOUND);
  }

  db.collection('locations').findOne({
    _id: locationId,
  }, {
    name: 1,
  }, (err, loc) => {
    if (err) {
      return next(err);
    }

    if (!loc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.location = loc;
    return next();
  });
};
