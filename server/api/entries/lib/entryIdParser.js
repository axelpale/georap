// URL parser middleware

var entriesDal = require('../dal');
var status = require('http-status-codes');
var db = require('tresdb-db');

module.exports = function (req, res, next) {
  var stringId = req.params.entryId;

  try {
    req.entryId = db.id(stringId);
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
