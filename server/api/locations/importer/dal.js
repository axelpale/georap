/* eslint-disable max-lines */

var config = require('tresdb-config');
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
  return path.resolve(config.tempUploadDir, batchId, batchId + '.json');
};

var outcomePathFromBatchId = function (batchId) {
  return path.resolve(config.tempUploadDir, batchId, batchId + '_outcome.json');
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

      // Turn relative file paths to absolute paths.
      // Detect URLs from http prefix.
      // We will download the URLs later.
      locs.forEach(function (loc) {
        loc.entries.forEach(function (entry) {
          var fp = entry.filepath;

          // Filepath is null when entry does not have an image
          if (fp !== null) {
            // Leave URLs untouched
            if (!fp.startsWith('http')) {
              entry.filepath = path.join(targetPath, fp);
            }
          }
        });
      });

      // Structure of loc at this point
      // {
      //   name: <string>
      //   latitude: <number>
      //   longitude: <number>
      //   entries: [{
      //     markdown: <string>
      //     filepath: <string>
      //   }]

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
          return callback(new Error('INVALID_KMZ'));
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


exports.mergeEntries = function (args, callback) {
  // Description by algorithm:
  // 1. For each given location with entries,
  //    find a nearest existing location.
  //   1.1. Get all existing entries of the existing location.
  //   1.2. For each new entry, compare it to the existing entries.
  //     1.2.1. If the new entry is unique, add it to the existing location.
  //
  // Parameters
  //   args
  //     locations
  //       array of import locations:
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

  var numEntryCandidates = 0;
  var numEntriesCreated = 0;
  var locationsModified = [];
  var locationsSkipped = [];

  asyn.eachSeries(args.locations, function (loc, next) {

    // Finding of unique entries requires following properties
    //   username
    //   markdown
    //   filepath
    // Therefore we map import entries into this format
    var entryCandidates = loc.entries.map(function (entry) {
      return {
        username: args.username,
        markdown: entry.markdown,
        filepath: entry.filepath,
      };
    });

    // Remember: for each location
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
      dallib.createEntries({
        locationId: loc.existing._id,
        locationName: loc.existing.name,
        username: args.username,
        entries: uniqueEntries,
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
