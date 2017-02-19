var dal = require('../../../entries/dal');
var status = require('http-status-codes');

var MIN_YEAR = 1900;
var MAX_YEAR = 3000;

var validYear = function (yearCandidate) {
  // Throws if not valid
  // Return integer year.

  var year = parseInt(yearCandidate, 10);  // Throws if not parsable

  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new Error('year out of range');
  }

  return year;
};

exports.create = function (req, res) {

  var locationId = req.locationId;
  var username = req.user.name;
  var year;

  try {
    if (!req.body.hasOwnProperty('year')) {
      throw new Error();
    }
    year = validYear(req.body.year);
  } catch (e) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.createLocationVisit({
    locationId: locationId,
    username: username,
    year: year,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.remove = function (req, res) {

  dal.removeLocationVisit({
    entryId: req.entryId,
    locationId: req.locationId,
    username: req.user.name,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};
