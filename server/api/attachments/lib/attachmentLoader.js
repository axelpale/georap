// URL parser middleware

var dal = require('../attachment/dal');
var status = require('http-status-codes');
var keyPattern = require('./keyPattern');

module.exports = function (req, res, next) {
  // Converts string object id to ObjectId and fetches the location.

  var key = req.params.attachmentKey;

  // Validate key
  if (!keyPattern.test(key)) {
    return res.status(status.BAD_REQUEST).send('Invalid attachment key');
  }

  dal.get(key, function (err, doc) {
    if (err) {
      return next(err);
    }

    if (!doc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.attachment = doc;
    return next();
  });
};
