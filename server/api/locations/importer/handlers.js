var local = require('../../../../config/local');
var uploads = require('../../../services/uploads');
var dal = require('./dal');

var status = require('http-status-codes');
var urljoin = require('url-join');
var path = require('path');

var uploadHandler = uploads.tempUploader.single('importfile');


var buildUrls = function (locs) {
  // Modifies given locations.
  // Convert absolute file paths to URLs.
  // This is most correct to do in handler because it is a REST thing.
  // Absolute filepaths are needed internally more often.
  locs.forEach(function (loc) {
    loc.entries.forEach(function (entry) {
      var rel, url;
      if (entry.filepath !== null) {
        if (entry.filepath.startsWith('/')) {
          rel = path.relative(local.tempUploadDir, entry.filepath);
          url = urljoin(local.tempUploadUrl, rel);
          entry.filepath = url;
        }
      }
    });
  });
};


exports.import = function (req, res) {
  // Import locations from KML, KMZ, or GPX file.
  // importfile is required.

  uploadHandler(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (typeof req.file !== 'object') {
      // No file was given.
      res.status(status.BAD_REQUEST);
      return res.send('no file given');
    }

    var ext = path.extname(req.file.originalname);

    var ext2methodName = {
      '.xml': 'readKML',
      '.kml': 'readKML',
      '.kmz': 'readKMZ',
    };
    var methodName = null;

    if (ext2methodName.hasOwnProperty(ext)) {
      methodName = ext2methodName[ext];
      return dal[methodName](req.file.path, function (errr, result) {
        if (errr) {
          if (errr.message === 'INVALID_KMZ') {
            res.status(status.BAD_REQUEST);
            return res.send('unknown filetype');
          }
          console.error(errr);
          return res.sendStatus(status.INTERNAL_SERVER_ERROR);
        }

        if (typeof result.batchId !== 'string') {
          throw new Error('invalid batchId');
        }

        var batchId = result.batchId;

        return res.json({
          batchId: batchId,
        });
      });
    }

    res.status(status.BAD_REQUEST);
    return res.send('unknown filetype');
  });
};


exports.getBatch = function (req, res) {

  var batchId = req.params.batchId;

  dal.getBatch(batchId, function (err, locs) {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.sendStatus(status.NOT_FOUND);
      }
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    buildUrls(locs);

    return res.json(locs);
  });
};

exports.getOutcome = function (req, res) {
  var batchId = req.params.batchId;
  dal.getOutcome(batchId, function (err, outcome) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(outcome);
  });
};


exports.importBatch = function (req, res) {
  var batchId = req.params.batchId;
  var indices = req.body.indices;
  var username = req.user.name;

  dal.importBatch({
    batchId: batchId,
    indices: indices,
    username: username,
  }, function (err, batchResult) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    dal.mergeEntries({
      locations: batchResult.skipped,
      username: username,
    }, function (errm, mergeResult) {
      if (errm) {
        console.error(errm);
        return res.sendStatus(status.INTERNAL_SERVER_ERROR);
      }

      var outcomeData = {
        batchId: batchId,
        created: batchResult.created,
        skipped: mergeResult.locationsSkipped,
        modified: mergeResult.locationsModified,
      };

      dal.writeBatchOutcome(outcomeData, function (errw) {
        if (errw) {
          console.error(errw);
          return res.sendStatus(status.INTERNAL_SERVER_ERROR);
        }

        return res.json(outcomeData);
      });
    });
  });
};
