const status = require('http-status-codes');
const postsDal = require('../dal');
const db = require('georap-db');

module.exports = (req, res, next) => {
  // Move entry to another location
  //
  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;
  const entry = req.entry;
  const toLocationIdCandidate = req.body.toLocationId;

  // Ensure proper object id
  let toLocationId;
  try {
    toLocationId = db.id(toLocationIdCandidate);
  } catch (e) {
    return res.status(status.BAD_REQUEST).send('Invalid target location id');
  }

  postsDal.moveLocationEntry({
    locationId: locationId,
    locationName: locationName,
    toLocationId: toLocationId,
    entryId: entry._id,
    username: username,
  }, (err) => {
    if (err) {
      if (err.name === 'NOT_FOUND') {
        const msg = 'Target location not found';
        return res.status(status.BAD_REQUEST).send(msg);
      }
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
