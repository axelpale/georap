
var dal = require('./dal');
var status = require('http-status-codes');


exports.count = function (req, res) {

  dal.count(function (err, numLocs) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(numLocs);
  });
};

exports.create = function (req, res) {

  var valid = (typeof req.body === 'object' &&
               typeof req.body.lat === 'number' &&
               typeof req.body.lng === 'number');

  if (!valid) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  var lat = req.body.lat;
  var lng = req.body.lng;

  dal.create(lat, lng, req.user.name, function (err, rawLoc) {
    if (err) {
      if (err.message === 'TOO_CLOSE') {
        return res.json('TOO_CLOSE');
      }
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(rawLoc);
  });
};
