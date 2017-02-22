// URL parser middleware

var dal = require('../location/dal');

var status = require('http-status-codes');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (req, res, next) {
  // Converts string object id to ObjectId and fetches the location.

  var stringId = req.params.locationId;
  var objId;

  try {
    objId = new ObjectId(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  dal.getRaw(objId, function (err, loc) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (!loc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.location = loc;
    return next();
  });
};
