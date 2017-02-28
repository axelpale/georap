// URL parser middleware

var status = require('http-status-codes');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (req, res, next) {
  var stringId = req.params.entryId;

  try {
    req.entryId = new ObjectId(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  return next();
};
