const config = require('georap-config');
const uploads = require('../../../services/uploads');
const importerDal = require('./dal');

const status = require('http-status-codes');
const urljoin = require('url-join');
const path = require('path');

const uploadHandler = uploads.tempUploader.single('importfile');

const buildUrls = function (batchLocs) {
  // Modifies given batch locations.
  // Convert absolute file paths to URLs.
  // This is most correct to do in handler because it is a REST thing.
  // Absolute filepaths are needed internally more often.
  batchLocs.forEach((loc) => {
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
  // A file to import is required.
  //
  // The import parses the file and creates a batch
  // which is a temporary JSON file. No locations are yet
  // added to collections.
  //
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

    // Extension
    const ext = path.extname(req.file.originalname);

    const ext2methodName = {
      '.xml': 'readKML',
      '.kml': 'readKML',
      '.kmz': 'readKMZ',
    };
    let methodName = null;

    if (!ext2methodName[ext]) {
      return res.status(status.BAD_REQUEST).send('unknown filetype');
    }

    methodName = ext2methodName[ext];
    return importerDal[methodName](req.file.path, (errr, result) => {
      if (errr) {
        if (errr.message === 'INVALID_KMZ') {
          return res.status(status.BAD_REQUEST).send('unknown filetype');
        }
        return next(errr);
      }

      if (typeof result.batchId !== 'string') {
        throw new Error('invalid batchId');
      }

      return res.json({
        batchId: result.batchId,
      });
    });
  });
};

exports.getBatch = function (req, res, next) {
  // Import creates a batch for preview.
  // The get batch handler provides means to fetch the batch for preview.
  //
  const batchId = req.params.batchId;

  importerDal.getBatch(batchId, (err, locs) => {
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

exports.runBatch = function (req, res, next) {
  // After a file is imported and parsed and a batch is created
  // the user can first preview and then run the batch.
  // This handler creates the locations and other data captured in the batch.
  //
  const batchId = req.params.batchId;
  const indices = req.body.indices;
  const username = req.user.name;

  importerDal.importBatch({
    batchId: batchId,
    indices: indices,
    username: username,
  }, (err, batchResult) => {
    if (err) {
      return next(err);
    }

    importerDal.mergeEntries({
      locations: batchResult.skipped,
      username: username,
    }, (errm, mergeResult) => {
      if (errm) {
        return next(errm);
      }

      // Report
      const outcomeData = {
        batchId: batchId,
        created: batchResult.created,
        skipped: mergeResult.locationsSkipped,
        modified: mergeResult.locationsModified,
      };

      importerDal.writeBatchOutcome(outcomeData, (errw) => {
        if (errw) {
          return next(errw);
        }

        return res.json(outcomeData);
      });
    });
  });
};

exports.getOutcome = function (req, res, next) {
  // After successful batch run, a temporary outcome JSON is created.
  // This outcome contains a report data how the batch ran.
  const batchId = req.params.batchId;
  importerDal.getOutcome(batchId, (err, outcome) => {
    if (err) {
      return next(err);
    }

    return res.json(outcome);
  });
};
