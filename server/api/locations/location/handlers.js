
var status = require('http-status-codes');
var dal = require('./dal');
var prepare = require('../lib/prepare');

exports.changeGeom = function (req, res) {

  var id, u, lat, lng;

  if (typeof req.body.lat !== 'number' ||
      typeof req.body.lng !== 'number') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  lat = req.body.lat;
  lng = req.body.lng;

  id = req.locationId;
  u = req.user.name;

  dal.changeGeom({
    locationId: id,
    username: u,
    latitude: lat,
    longitude: lng,
  }, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.changeName = function (req, res) {

  if (typeof req.body.newName !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  var id = req.locationId;
  var u = req.user.name;

  dal.changeName(id, req.body.newName, u, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.changeTags = function (req, res) {

  var id, u, tags;

  if (typeof req.body.tags !== 'object') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  id = req.locationId;
  u = req.user.name;
  tags = req.body.tags;

  dal.changeTags({
    locationId: id,
    username: u,
    tags: tags,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.getOne = function (req, res) {
  // Fetch single location

  dal.getOne(req.locationId, function (err, rawLoc) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (!rawLoc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    var loc = prepare.location(rawLoc);

    return res.json(loc);
  });
};

exports.removeOne = function (req, res) {
  // Delete single location

  dal.removeOne(req.locationId, req.user.name, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};
