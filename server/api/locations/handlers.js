
var status = require('http-status-codes');

var dal = require('./dal');
var uploads = require('../../handlers/lib/attachments/uploads');
var prepare = require('./lib/prepare');

exports.count = function (req, res) {

  dal.count(function (err, numLocs) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(numLocs);
  });
};

exports.create = function (req, res) {

  var lat, lng;
  var valid = (typeof req.body === 'object' &&
               typeof req.body.lat === 'string' &&
               typeof req.body.lng === 'string');

  if (valid) {
    try {
      lat = parseFloat(req.body.lat);
      lng = parseFloat(req.body.lng);
    } catch (err) {
      valid = false;
    }
  }

  if (!valid) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.create(lat, lng, req.user.name, function (err, rawLoc) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
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

exports.changeGeom = function (req, res) {

  var id, u, lat, lng;

  if (typeof req.body.lat !== 'string' ||
      typeof req.body.lng !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  try {
    lat = parseFloat(req.body.lat);
    lng = parseFloat(req.body.lng);
  } catch (e) {
    return res.sendStatus(status.BAD_REQUEST);
  }

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

exports.addAttachment = function (req, res) {
  // HTTP request handler

  var locationId = req.locationId;
  var uploadHandler = uploads.uploader.single('locfile');
  var userName = req.user.name;

  uploadHandler(req, res, function (err2) {
    if (err2) {
      console.error(err2);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    //
    // console.log('req.file:');
    // console.log(req.file);

    // Upload successful. Append an attachment entry to the location.
    dal.addAttachment({
      locationId: locationId,
      userName: userName,
      filePathInUploadDir: uploads.getRelativePath(req.file.path),
      fileMimeType: req.file.mimetype,
    }, function (err3, newEntry) {
      if (err3) {
        console.error(err3);
        return res.sendStatus(status.INTERNAL_SERVER_ERROR);
      }

      // Send delta event
      return res.json({
        success: {
          type: 'entry_added',
          actor: userName,
          data: {
            locationId: locationId,
            entry: prepare.entry(newEntry),
          },
        },
      });

    });
  });
};
