
var templates = require('./templates');
var dal = require('./dal');
var status = require('http-status-codes');
var sanitizeFilename = require('sanitize-filename');
var slugify = require('slugify');


exports.changeGeom = function (req, res, next) {

  var u, lat, lng;
  var loc = req.location;

  if (typeof req.body.lat !== 'number' ||
      typeof req.body.lng !== 'number') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  lat = req.body.lat;
  lng = req.body.lng;
  u = req.user.name;

  dal.changeGeom({
    locationId: loc._id,
    locationName: loc.name,
    locationGeom: loc.geom,
    locationLayer: loc.layer,
    username: u,
    latitude: lat,
    longitude: lng,
  }, function (err) {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};



exports.changeName = function (req, res, next) {

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
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};



exports.changeTags = function (req, res, next) {

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
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};



exports.getOne = function (req, res, next) {
  // Fetch single location with entries and events

  // eslint-disable-next-line max-statements
  dal.getOne(req.location._id, function (err, rawLoc) {
    if (err) {
      return next(err);
    }

    if (!rawLoc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    var responseStr, filename, mime;
    var format = req.query.format;

    if (typeof format === 'string') {
      format = format.toLowerCase();

      if (format === 'geojson') {
        responseStr = templates.geojson(rawLoc, true);
        mime = 'application/vnd.geo+json';
      }

      if (format === 'gpx') {
        responseStr = templates.gpx(rawLoc);
        mime = 'application/gpx+xml';
      }

      if (format === 'kml') {
        responseStr = templates.kml(rawLoc);
        mime = 'application/vnd.google-earth.kml+xml';
      }

      if (typeof mime !== 'string') {
        // This mime type is not found
        return res.sendStatus(status.NOT_FOUND);
      }

      // Name of the file to download.
      // Slugification is needed after sanitizeFilename because
      // http headers do not handle non-ascii and non-alpha-numerics well.
      // See https://stackoverflow.com/q/93551/638546
      filename = slugify(sanitizeFilename(rawLoc.name)) + '.' + format;

      // Set headers
      res.set('Content-Type', mime);
      res.set('Content-Disposition', 'attachment; filename=' + filename);

      return res.send(responseStr);
    }  // else

    return res.json(rawLoc);
  });
};



exports.removeOne = function (req, res, next) {
  // Delete single location

  dal.removeOne(req.location._id, req.user.name, function (err) {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
