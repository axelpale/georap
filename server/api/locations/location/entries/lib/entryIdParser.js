// URL parser middleware

var entriesDal = require('../../../../entries/dal');
var status = require('http-status-codes');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (req, res, next) {
  var stringId = req.params.entryId;

  try {
    req.entryId = new ObjectId(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  entriesDal.getOneRaw(req.entryId, function (err, entry) {
    if (err) {
      return next(err);
    }

    if (!entry) {
      return res.sendStatus(status.NOT_FOUND);
    }

    req.entry = entry;
    return next();
  });
};
