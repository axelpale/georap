// URL parser middleware

var dal = require('../location/dal');

var status = require('http-status-codes');
var db = require('tresdb-db');

module.exports = function (req, res, next) {
  // Converts string object id to ObjectId and fetches the location.

  var stringId = req.params.locationId;
  var objId;

  try {
    objId = db.id(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  dal.getRaw(objId, function (err, loc) {
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
