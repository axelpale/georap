// URL parser middleware

var status = require('http-status-codes');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (req, res, next) {
  // Converts string object id to ObjectId

  var stringId = req.params.locationId;

  try {
    req.locationId = new ObjectId(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  return next();
};
