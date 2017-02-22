
var status = require('http-status-codes');
var dal = require('./dal');
var prepare = require('../lib/prepare');

exports.changeGeom = function (req, res) {

  var u, lat, lng;

  if (typeof req.body.lat !== 'number' ||
      typeof req.body.lng !== 'number') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  lat = req.body.lat;
  lng = req.body.lng;
  u = req.user.name;

  dal.changeGeom({
    locationId: req.location._id,
    locationName: req.location.name,
    locationGeom: req.location.geom,
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

  var params = {
    locationId: req.location._id,
    locationName: req.location.name,
    newName: req.body.newName,
    username: req.user.name,
  };

  dal.changeName(params, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.changeTags = function (req, res) {

  if (typeof req.body.tags !== 'object') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.changeTags({
    locationId: req.location._id,
    locationName: req.location.name,
    locationTags: req.location.tags,
    username: req.user.name,
    tags: req.body.tags,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.getOne = function (req, res) {
  // Fetch single location with entries and events

  dal.getOne(req.location._id, function (err, rawLoc) {
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

  dal.removeOne(req.location._id, req.user.name, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};
