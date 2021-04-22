// URL parser middleware

const entriesDal = require('../dal');
const status = require('http-status-codes');
const db = require('tresdb-db');

module.exports = function (req, res, next) {
  const stringId = req.params.entryId;

  try {
    req.entryId = db.id(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  entriesDal.getOneRaw(req.entryId, (err, entry) => {
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
