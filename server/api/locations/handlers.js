
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

exports.addAttachment = function (req, res) {
  // HTTP request handler

  var locationId = req.locationId;
  var uploadHandler = uploads.uploader.single('locfile');
  var username = req.user.name;

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
      username: username,
      filePathInUploadDir: uploads.getRelativePath(req.file.path),
      fileMimeType: req.file.mimetype,
    }, function (err3) {
      if (err3) {
        console.error(err3);
        return res.sendStatus(status.INTERNAL_SERVER_ERROR);
      }
      return res.sendStatus(status.OK);
    });
  });
};

exports.addStory = function (req, res) {
  // HTTP request handler

  var locationId = req.locationId;
  var username = req.user.name;
  var markdown = req.body.markdown;

  if (typeof markdown !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.addStory({
    locationId: locationId,
    username: username,
    markdown: markdown,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};

exports.addVisit = function (req, res) {
  // HTTP request handler

  var locationId = req.locationId;
  var username = req.user.name;

  var year;
  var MIN_YEAR = 1900;
  var MAX_YEAR = 3000;
  try {
    if (!req.body.hasOwnProperty('year')) {
      throw new Error();
    }
    year = parseInt(req.body.year, 10);
    if (year < MIN_YEAR || year > MAX_YEAR) {
      throw new Error('year out of range');
    }
  } catch (e) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.addVisit({
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
