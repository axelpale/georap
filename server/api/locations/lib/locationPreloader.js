// URL parser middleware
const dal = require('../location/dal');
const status = require('http-status-codes');
const db = require('georap-db');

module.exports = function (req, res, next) {
  // Converts string object id to ObjectId and fetches the location.

  const stringId = req.params.locationId;
  let objId;

  try {
    objId = db.id(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  dal.getRaw(objId, (err, loc) => {
    if (err) {
      return next(err);
    }

    if (!loc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.location = loc;

    // Mark ownership for capability checking
    if (req.user && req.user.name === loc.creator) {
      req.isOwner = true;
    } else {
      req.isOwner = false;
    }

    return next();
  });
};
