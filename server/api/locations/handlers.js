
var uploads = require('../../services/uploads');
var uploadHandler = uploads.tempUploader.single('importfile');
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
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(rawLoc);
  });
};

exports.import = function (req, res) {
  // Import locations from KML or GPX file.
  // importfile is required.

  //var username = req.user.name;

  uploadHandler(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    //console.log('req.file:');
    //console.log(req.file);

    if (typeof req.file !== 'object') {
      // No file was given.
      res.status(status.BAD_REQUEST);
      return res.send('no file given');
    }

    res.status(status.BAD_REQUEST);
    return res.send('unknown filetype');

    //filepath: uploads.getRelativePath(req.file.path),
    //mimetype: req.file.mimetype,
  });
};
