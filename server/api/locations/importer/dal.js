/* eslint-disable max-statements,max-lines */

var local = require('../../../../config/local');
var parsekml = require('./parsekml');
var createLocationFromImport = require('./createLocation');
var extract = require('extract-zip');
var asyn = require('async');
var glob = require('glob');
var path = require('path');
var fs = require('fs-extra');


var batchIdFromPath = function (p) {
  // Handlers provide the absolute path but we need the directory name.
  return path.basename(path.dirname(p));
};

var cachePathFromBatchId = function (batchId) {
  // For example
  //   '2017-10-13-weivd32'
  //   => '/home/...../tempUploads/2017-10-13-weivd32/2017-10-13-weivd32.json
  return path.resolve(local.tempUploadDir, batchId, batchId + '.json');
};

var outcomePathFromBatchId = function (batchId) {
  return path.resolve(local.tempUploadDir, batchId, batchId + '_outcome.json');
};

var writeBatchOutcome = function (outcomePath, createdLocs, skippedLocs, cb) {
  // Write a JSON file about the outcome of an import.
  var data = {
    created: createdLocs,
    skipped: skippedLocs,
  };

  fs.writeJSON(outcomePath, data, cb);
};


exports.getBatch = function (batchId, callback) {
  // Return batch as array of locations.
  var cachePath = cachePathFromBatchId(batchId);
  fs.readJSON(cachePath, callback);
};

exports.getOutcome = function (batchId, callback) {
  var p = outcomePathFromBatchId(batchId);
  fs.readJSON(p, callback);
};


exports.readKML = function (kmlpath, callback) {

  fs.readFile(kmlpath, function (err, content) {
    if (err) {
      return callback(err);
    }

    return parsekml(content, function (errp, locs) {
      if (errp) {
        return callback(errp);
      }

      var batchId = batchIdFromPath(kmlpath);
      var importCache = cachePathFromBatchId(batchId);

      fs.writeFile(importCache, locs, function (errw) {
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

exports.readKMZ = function (kmzpath, callback) {
  // KMZ is a zipped collection of resources and KML files.
  // The collection contains images and therefore we must temporarily
  // store them.

  var targetPath = path.dirname(kmzpath);

  // Fight against the pyramid of doom
  var andThenRead = function (mainKmlPath) {
    exports.readKML(mainKmlPath, function (errk, result) {
      if (errk) {
        return callback(errk);
      }

      var batchId = result.batchId;
      var locs = result.locations;

      // Turn relative file paths to absolute paths
      locs.forEach(function (loc) {
        loc.overlays.forEach(function (overlay) {
          var abs = path.join(targetPath, overlay.href);
          overlay.href = abs;
        });
      });

      var cachePath = cachePathFromBatchId(batchId);

      fs.writeJSON(cachePath, locs, function (errw) {
        if (errw) {
          return callback(errw);
        }

        return callback(null, {
          batchId: batchId,
          locations: locs,
        });
      });

    });
  };

  // TODO what if zip contains files with illegal characters in names
  extract(kmzpath, {
    dir: targetPath,
  }, function (erre) {
    if (erre) {
      return callback(erre);
    }

    // KMZ archive must contain doc.kml as the main kml file.
    // See https://developers.google.com/kml/documentation/kmzarchives
    var docPath = path.resolve(targetPath, 'doc.kml');

    fs.pathExists(docPath, function (errx, exist) {
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
      }, function (errg, foundFilePaths) {
        if (errg) {
          return callback(errg);
        }

        if (foundFilePaths.length === 0) {
          // No locations available
          return callback(null, {
            name: batchIdFromPath(kmzpath),
            locations: [],
          });
        }

        //console.log('foundFilePaths', foundFilePaths);
        return andThenRead(foundFilePaths[0]);
      });
    });
  });

};


exports.importBatch = function (args, callback) {
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
  //       array of integers
  //     username
  //       string, who is importing
  //   callback
  //     function (err, data)
  //       err
  //       data
  //         batchId
  //         numLocationsCreated
  //         locationsCreated
  //         locationsSkipped:
  //

  var indices = args.indices;
  var username = args.username;

  exports.getBatch(args.batchId, function (err, locs) {
    if (err) {
      return callback(err);
    }

    // Create locations. Location creation includes calls to database,
    // so it is async operation.

    var locsCreated = [];
    var locsSkipped = [];

    asyn.mapSeries(indices, function iteratee(index, next) {

      var loc = locs[index];

      if (typeof loc === 'undefined') {
        console.log('Index not found');
        return next();
      }

      createLocationFromImport(loc, username, function (errc) {
        if (errc) {
          if (errc.message === 'TOO_CLOSE') {
            locsSkipped.push(loc);
            return next();
          }
          return next(errc);
        }

        locsCreated.push(loc);

        return next();
      });
    }, function then(erra) {
      if (erra) {
        console.error(erra);
        return callback(erra);
      }

      // Assert
      if (indices.length !== locsCreated.length) {
        console.log('Intended to create', indices.length,
                    'locations but', locsCreated.length,
                    'were created. Skipped', locsSkipped.length,
                    'locations.');
      }

      var p = outcomePathFromBatchId(args.batchId);

      writeBatchOutcome(p, locsCreated, locsSkipped, function (erro) {
        if (erro) {
          console.error(erro);
          return callback(erro);
        }

        return callback(null, {
          batchId: args.batchId,
          numLocationsCreated: locsCreated.length,
          locationsCreated: locsCreated,
          locationsSkipped: locsSkipped,
        });
      });
    });
  });
};
