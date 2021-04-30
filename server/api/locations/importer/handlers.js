const config = require('georap-config');
const uploads = require('../../../services/uploads');
const dal = require('./dal');

const status = require('http-status-codes');
const urljoin = require('url-join');
const path = require('path');

const uploadHandler = uploads.tempUploader.single('importfile');


const buildUrls = function (locs) {
  // Modifies given locations.
  // Convert absolute file paths to URLs.
  // This is most correct to do in handler because it is a REST thing.
  // Absolute filepaths are needed internally more often.
  locs.forEach((loc) => {
    loc.entries.forEach((entry) => {
      let rel, url;
      if (entry.filepath !== null) {
        if (entry.filepath.startsWith('/')) {
          rel = path.relative(config.tempUploadDir, entry.filepath);
          url = urljoin(config.tempUploadUrl, rel);
          entry.filepath = url;
        }
      }
    });
  });
};


exports.import = function (req, res, next) {
  // Import locations from KML, KMZ, or GPX file.
  // importfile is required.

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      return next(err);
    }

    if (typeof req.file !== 'object') {
      // No file was given.
      res.status(status.BAD_REQUEST);
      return res.send('no file given');
    }

    const ext = path.extname(req.file.originalname);

    const ext2methodName = {
      '.xml': 'readKML',
      '.kml': 'readKML',
      '.kmz': 'readKMZ',
    };
    let methodName = null;

    if (ext2methodName[ext]) {
      methodName = ext2methodName[ext];
      return dal[methodName](req.file.path, (errr, result) => {
        if (errr) {
          if (errr.message === 'INVALID_KMZ') {
            res.status(status.BAD_REQUEST);
            return res.send('unknown filetype');
          }
          return next(errr);
        }

        if (typeof result.batchId !== 'string') {
          throw new Error('invalid batchId');
        }

        const batchId = result.batchId;

        return res.json({
          batchId: batchId,
        });
      });
    }

    res.status(status.BAD_REQUEST);
    return res.send('unknown filetype');
  });
};


exports.getBatch = function (req, res, next) {

  const batchId = req.params.batchId;

  dal.getBatch(batchId, (err, locs) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.sendStatus(status.NOT_FOUND);
      }
      return next(err);
    }

    buildUrls(locs);

    return res.json(locs);
  });
};

exports.getOutcome = function (req, res, next) {
  const batchId = req.params.batchId;
  dal.getOutcome(batchId, (err, outcome) => {
    if (err) {
      return next(err);
    }

    return res.json(outcome);
  });
};


exports.importBatch = function (req, res, next) {
  const batchId = req.params.batchId;
  const indices = req.body.indices;
  const username = req.user.name;

  dal.importBatch({
    batchId: batchId,
    indices: indices,
    username: username,
  }, (err, batchResult) => {
    if (err) {
      return next(err);
    }

    dal.mergeEntries({
      locations: batchResult.skipped,
      username: username,
    }, (errm, mergeResult) => {
      if (errm) {
        return next(errm);
      }

      const outcomeData = {
        batchId: batchId,
        created: batchResult.created,
        skipped: mergeResult.locationsSkipped,
        modified: mergeResult.locationsModified,
      };

      dal.writeBatchOutcome(outcomeData, (errw) => {
        if (errw) {
          return next(errw);
        }

        return res.json(outcomeData);
      });
    });
  });
};
