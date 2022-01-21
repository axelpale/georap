// URL parser middleware

const dal = require('../attachment/dal');
const status = require('http-status-codes');
const georapkey = require('georap-key');

module.exports = function (req, res, next) {
  // Converts string object id to ObjectId and fetches the location.

  const key = req.params.attachmentKey;

  // Validate key
  if (!georapkey.validate(key)) {
    return res.status(status.BAD_REQUEST).send('Invalid attachment key');
  }

  dal.get(key, (err, doc) => {
    if (err) {
      return next(err);
    }

    if (!doc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.attachment = doc;

    // Mark ownership for capability checking
    if (req.user && req.user.name === doc.user) {
      req.isOwner = true;
    } else {
      req.isOwner = false;
    }

    return next();
  });
};
