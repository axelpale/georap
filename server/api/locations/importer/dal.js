/* eslint-disable max-lines */

var local = require('../../../../config/local');
var entriesDal = require('../../entries/dal');
var parsekml = require('./parsekml');
var dallib = require('./dallib');
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

      fs.writeJSON(importCache, locs, function (errw) {
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
  //         locationsCreated
  //           array of raw db locations
  //         locationsSkipped
  //           array of import locations

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

      dallib.createLocation(loc, username, function (errc, newRawLoc) {
        if (errc) {
          if (errc.message === 'TOO_CLOSE') {
            loc.existing = errc.data;
            locsSkipped.push(loc);
            return next();
          }
          return next(errc);
        }

        locsCreated.push(newRawLoc);

        return next();
      });
    }, function then(erra) {
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


exports.mergeAttachments = function (args, callback) {
  // Description by algorithm:
  // 1. For each given location with attachments,
  //    find a nearest existing location.
  //   1.1. Get all existing attachments of the existing location.
  //   1.2. For each new attachment, compare it to the existing attachments.
  //     1.2.1. If new attachment is unique, add it to the existing location.
  //
  // Parameters
  //   args
  //     locations
  //       array of import locations:
  //         descriptions
  //         overlays
  //         existing
  //           _id
  //           name
  //     username
  //       creator of the attachments
  //   callback
  //     function (err, result)
  //       err
  //       result
  //
  //

  var numEntryCandidates = 0;
  var numEntriesCreated = 0;
  var locationsModified = [];
  var locationsSkipped = [];

  asyn.eachSeries(args.locations, function (loc, next) {

    // Finding of unique entries requires following properties
    //   username
    //   markdown
    //   filepath
    // Therefore we map descriptions and overlays into this format
    var entryCandidates = [];
    loc.descriptions.forEach(function (desc, index) {
      entryCandidates.push({
        type: 'descriptions',
        index: index,  // to find after filter
        username: args.username,
        markdown: desc,
        filepath: null,
      });
    });
    loc.overlays.forEach(function (overlay, index) {
      entryCandidates.push({
        type: 'overlays',
        index: index,  // to find after filter
        username: args.username,
        markdown: overlay.description,
        filepath: overlay.href,
      });
    });

    numEntryCandidates += entryCandidates.length;

    // We like to merge the entries into target location.
    var targetId = loc.existing._id;

    // We first get the unique entries...
    entriesDal.filterUniqueLocationEntries({
      locationId: targetId,
      entryCandidates: entryCandidates,
    }, function (errf, uniqueEntries) {
      if (errf) {
        return next(errf);
      }

      if (uniqueEntries.length > 0) {
        numEntriesCreated += uniqueEntries.length;
        locationsModified.push(loc.existing);
      } else {
        locationsSkipped.push(loc.existing);
      }

      // ...and then create them.
      asyn.eachSeries(uniqueEntries, function (entry, next2) {
        // Fuck this is messy.. we need to process descriptions
        // and overlays separately, that is the reason.
        var orig = loc[entry.type][entry.index];

        if (entry.type === 'descriptions') {
          dallib.createDescriptions({
            locationId: loc.existing._id,
            locationName: loc.existing.name,
            username: args.username,
            descriptions: [orig],
          }, next2);
        } else if (entry.type === 'overlays') {
          dallib.createOverlays({
            locationId: loc.existing._id,
            locationName: loc.existing.name,
            username: args.username,
            overlays: [orig],
          }, next2);
        } else {
          throw new Error('invalid entry.type');
        }
      }, next);
    });
  }, function (errs) {
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


exports.writeBatchOutcome = function (outcome, cb) {
  // Write a JSON file about the outcome of an import.
  //
  // Parameters
  //   outcome
  //     batchId
  //     created
  //     skipped
  //   cb
  //     function (err)
  //
  var outcomePath = outcomePathFromBatchId(outcome.batchId);

  fs.writeJSON(outcomePath, outcome, cb);
};
