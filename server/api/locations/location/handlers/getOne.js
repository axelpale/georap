const locationDal = require('../dal');
const templates = require('../templates');
const loggers = require('../../../../services/logs/loggers');
const sanitizeFilename = require('sanitize-filename');
const status = require('http-status-codes');
const slugify = require('slugify');

module.exports = (req, res, next) => {
  // Fetch single location with thumbnail and events

  // eslint-disable-next-line max-statements
  locationDal.getOneComplete(req.location._id, (err, rawLoc) => {
    if (err) {
      return next(err);
    }

    if (!rawLoc) {
      return res.sendStatus(status.NOT_FOUND);
    }

    let responseStr, filename, mime;
    let format = req.query.format;

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

    // Log that user has viewed a location.
    if (req.user) {
      loggers.log(req.user.name + ' viewed location ' + rawLoc.name + '.');
    }

    return res.json(rawLoc);
  });
};
