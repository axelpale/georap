/* eslint-disable max-lines */

const config = require('georap-config');
const entriesDal = require('../../entries/dal');
const parsekml = require('./parsekml');
const dallib = require('./dallib');
const extract = require('extract-zip');
const asyn = require('async');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');

// Helper functions

const batchIdFromPath = (p) => {
  // Handlers provide the absolute path but we need the directory name.
  return path.basename(path.dirname(p));
};

const cachePathFromBatchId = (batchId) => {
  // For example
  //   '2017-10-13-weivd32'
  //   => '/home/...../tempUploads/2017-10-13-weivd32/2017-10-13-weivd32.json
  return path.resolve(config.tempUploadDir, batchId, batchId + '.json');
};

const outcomePathFromBatchId = (batchId) => {
  return path.resolve(config.tempUploadDir, batchId, batchId + '_outcome.json');
};

// Public functions

exports.getBatch = (batchId, callback) => {
  // Return batch as array of locations.
  const cachePath = cachePathFromBatchId(batchId);
  fs.readJSON(cachePath, callback);
};

exports.getOutcome = (batchId, callback) => {
  const p = outcomePathFromBatchId(batchId);
  fs.readJSON(p, callback);
};


exports.readKML = (kmlpath, callback) => {

  fs.readFile(kmlpath, (err, content) => {
    if (err) {
      return callback(err);
    }

    return parsekml(content, (errp, locs) => {
      if (errp) {
        return callback(errp);
      }

      const batchId = batchIdFromPath(kmlpath);
      const importCache = cachePathFromBatchId(batchId);

      fs.writeJSON(importCache, locs, (errw) => {
        if (errw) {
          return callback(errw);
        }

        return callback(null, {
          batchId: batchId,
          locations: locs,
        });
      });

    });
  });
};

exports.readKMZ = (kmzpath, callback) => {
  // KMZ is a zipped collection of resources and KML files.
  // The collection contains images and therefore we must temporarily
  // store them.

  const targetPath = path.dirname(kmzpath);

  // Fight against the pyramid of doom
  const andThenRead = (mainKmlPath) => {
    exports.readKML(mainKmlPath, (errk, result) => {
      if (errk) {
        return callback(errk);
      }

      const batchId = result.batchId;
      const batchLocs = result.locations;

      // Turn relative file paths to absolute paths.
      // Detect URLs from http prefix.
      // We will download the URLs later.
      batchLocs.forEach((batchLoc) => {
        batchLoc.entries.forEach((entry) => {
          const fp = entry.filepath;

          // Filepath is null when entry does not have an image
          if (fp !== null) {
            // Leave URLs untouched
            if (!fp.startsWith('http')) {
              entry.filepath = path.join(targetPath, fp);
            }
          }
        });
      });

      // Structure of a batchLoc at this point
      // {
      //   name: <string>
      //   latitude: <number>
      //   longitude: <number>
      //   entries: [{
      //     markdown: <string>
      //     filepath: <string>
      //     overlay: <optional object>
      //   }]

      const cachePath = cachePathFromBatchId(batchId);

      fs.writeJSON(cachePath, batchLocs, (errw) => {
        if (errw) {
          return callback(errw);
        }

        return callback(null, {
          batchId: batchId,
          locations: batchLocs,
        });
      });
    });
  };

  // TODO what if zip contains files with illegal characters in names
  extract(kmzpath, {
    dir: targetPath,
  }, (erre) => {
    if (erre) {
      return callback(erre);
    }

    // KMZ archive must contain doc.kml as the main kml file.
    // See https://developers.google.com/kml/documentation/kmzarchives
    const docPath = path.resolve(targetPath, 'doc.kml');

    fs.pathExists(docPath, (errx, exist) => {
      if (errx) {
        return callback(errx);
      }

      if (exist) {
        return andThenRead(docPath);
      }

      // Find alternative main kml
      glob('/*.kml', {
        root: targetPath,
        nodir: true,
      }, (errg, foundFilePaths) => {
        if (errg) {
          return callback(errg);
        }

        if (foundFilePaths.length === 0) {
          // No locations available
          return callback(new Error('INVALID_KMZ'));
        }

        //console.log('foundFilePaths', foundFilePaths);
        return andThenRead(foundFilePaths[0]);
      });
    });
  });

};


exports.runBatch = (args, callback) => {
  // After a user has first uploaded a KML or other importable file,
  // then the user selects which locations to import. The uploaded and
  // parsed locations are stored as an array in a JSON file on server-side.
  // Therefore client must only provide the import ID and the positions of
  // the to-be-imported locations in the JSON.
  //
  // Parameters
  //   args
  //     batchId
  //       string
  //     indices
  //       array of integers. Array indices of selected batch locations.
  //     username
  //       string, who is importing
  //   callback
  //     function (err, data)
  //       err
  //       data
  //         batchId
  //         locationsCreated
  //           array of raw db locations
  //         locationsSkipped
  //           array of batch locations
  //

  const indices = args.indices;
  const username = args.username;

  exports.getBatch(args.batchId, (err, batchLocs) => {
    if (err) {
      return callback(err);
    }

    // Create locations. Location creation includes calls to database,
    // so it is async operation.

    const locsCreated = [];
    const locsSkipped = [];

    asyn.mapSeries(indices, (index, next) => {

      const batchLoc = batchLocs[index];

      if (typeof batchLoc === 'undefined') {
        console.log('Index not found');
        return next();
      }

      dallib.createLocation(batchLoc, username, (errc, newRawLoc) => {
        if (errc) {
          if (errc.message === 'TOO_CLOSE') {
            batchLoc.existing = errc.data;
            locsSkipped.push(batchLoc);
            return next();
          }
          return next(errc);
        }

        locsCreated.push(newRawLoc);

        return next();
      });
    }, (erra) => {
      if (erra) {
        console.error(erra);
        return callback(erra);
      }

      // Assert
      // if (indices.length !== locsCreated.length) {
      //   console.log('Intended to create', indices.length,
      //               'locations but', locsCreated.length,
      //               'were created. Skipped', locsSkipped.length,
      //               'locations.');
      // }

      return callback(null, {
        batchId: args.batchId,
        created: locsCreated,
        skipped: locsSkipped,
      });
    });
  });
};


exports.mergeEntries = (args, callback) => {
  // Description by algorithm:
  // 1. For each given batch location with entries,
  //    find a nearest existing location.
  //   1.1. Get all existing entries of the existing location.
  //   1.2. For each new entry, compare it to the existing entries.
  //     1.2.1. If the new entry is unique, add it to the existing location.
  //
  // Parameters
  //   args
  //     locations
  //       array of batch locations:
  //         entries
  //         existing
  //           _id
  //           name
  //     username
  //       creator for the entries
  //   callback
  //     function (err, result)
  //       err
  //       result
  //         locationsModified
  //         locationsSkipped
  //         numEntryCandidates
  //         numEntriesCreated
  //

  let numEntryCandidates = 0;
  let numEntriesCreated = 0;
  const locationsModified = [];
  const locationsSkipped = [];

  asyn.eachSeries(args.locations, (batchLoc, next) => {

    // Finding of unique entries requires following properties
    //   username
    //   markdown
    //   filepath
    // Therefore we map import entries into this format
    const entryCandidates = batchLoc.entries.map((entry) => {
      return {
        username: args.username,
        markdown: entry.markdown,
        filepath: entry.filepath,
      };
    });

    // Remember: for each location
    numEntryCandidates += entryCandidates.length;

    // We like to merge the entries into target location.
    const targetId = batchLoc.existing._id;

    // We first get the unique entries...
    entriesDal.filterUniqueLocationEntries({
      locationId: targetId,
      entryCandidates: entryCandidates,
    }, (errf, uniqueEntries) => {
      if (errf) {
        return next(errf);
      }

      if (uniqueEntries.length > 0) {
        numEntriesCreated += uniqueEntries.length;
        locationsModified.push(batchLoc.existing);
      } else {
        locationsSkipped.push(batchLoc.existing);
      }

      // ...and then create them.
      dallib.createEntries({
        locationId: batchLoc.existing._id,
        locationName: batchLoc.existing.name,
        username: args.username,
        entries: uniqueEntries,
      }, next);
    });
  }, (errs) => {
    if (errs) {
      return callback(errs);
    }

    return callback(null, {
      locationsModified: locationsModified,
      locationsSkipped: locationsSkipped,
      numEntryCandidates: numEntryCandidates,
      numEntriesCreated: numEntriesCreated,
    });
  });
};


exports.writeBatchOutcome = (outcome, cb) => {
  // Write a JSON file about the outcome of an batch run.
  //
  // Parameters
  //   outcome
  //     batchId
  //     created
  //     skipped
  //   cb
  //     function (err)
  //
  const outcomePath = outcomePathFromBatchId(outcome.batchId);

  fs.writeJSON(outcomePath, outcome, cb);
};
