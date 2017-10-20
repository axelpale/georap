
var uploads = require('../../../services/uploads');
var entriesDal = require('../../entries/dal');
var locationsDal = require('../dal');
var asyn = require('async');
var mime = require('mime');
var path = require('path');


var getMimetype = function (filepath) {
  var ext = path.extname(filepath);
  return mime.getType(ext.substr(1));
};


exports.transformDescription = function (args) {
  // Parameters
  //   args
  //     locationId
  //     locationName
  //     username
  //     description
  return {
    locationId: args.locationId,
    locationName: args.locationName,
    username: args.username,
    markdown: args.description,
    isVisit: false,
    filepath: null,
    mimetype: null,
    thumbfilepath: null,
    thumbmimetype: null,
  };
};


exports.createDescriptions = function (args, callback) {
  // Parameters:
  //   args
  //     locationId
  //     locationName
  //     username
  //     descriptions
  //   callback
  //     function (err)
  //
  var descs = args.descriptions;

  asyn.eachSeries(descs, function (desc, next) {
    var entryArgs = exports.transformDescription({
      locationId: args.locationId,
      locationName: args.locationName,
      username: args.username,
      description: desc,
    });
    entriesDal.createLocationEntry(entryArgs, next);
  }, callback);
};


exports.createOverlays = function (args, callback) {
  // Parameters:
  //   args
  //     locationId
  //     locationName
  //     username
  //     overlays
  //   callback
  //     function (err)
  //
  var overlays = args.overlays;

  asyn.eachSeries(overlays, function (overlay, next) {

    // copy the image files and create thumbnails
    uploads.makePermanent(overlay.href, function (errp, newhref) {
      // Parameters:
      //   errp
      //   newhref
      //     string, absolute path
      //
      if (errp) {
        return next(errp);
      }

      var mimetype = getMimetype(newhref);

      uploads.createThumbnail({
        path: newhref,
        mimetype: mimetype,
      }, function (errt, thumb) {
        if (errt) {
          return next(errt);
        }

        // Now, when thumbnail is created, is time to add the post.
        // The image paths must be relative to the uploads dir.

        entriesDal.createLocationEntry({
          locationId: args.locationId,
          locationName: args.locationName,
          username: args.username,
          markdown: overlay.description,
          isVisit: false,
          filepath: uploads.getRelativePath(newhref),
          mimetype: mimetype,
          thumbfilepath: uploads.getRelativePath(thumb.path),
          thumbmimetype: thumb.mimetype,
        }, next);
      });
    });
  }, callback);
};


exports.createLocation = function (loc, username, callback) {
  // Parameters
  //   loc
  //     imported location object with properties
  //       name
  //       latitude
  //       longitude
  //       descriptions
  //       overlays
  //   username
  //     string, creator
  //   callback
  //     function (err)
  //       err
  //         if new location too close an existing one
  //           err.message = 'TOO_CLOSE'
  //           err.data = <locationId>

  locationsDal.createLocation({
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    username: username,
    tags: [],
  }, function (errc, rawLoc) {
    if (errc) {
      return callback(errc);
    }

    exports.createDescriptions({
      locationId: rawLoc._id,
      locationName: rawLoc.name,
      username: rawLoc.creator,
      descriptions: loc.descriptions,
    }, function (err1) {
      if (err1) {
        return callback(err1);
      }

      exports.createOverlays({
        locationId: rawLoc._id,
        locationName: rawLoc.name,
        username: rawLoc.creator,
        overlays: loc.overlays,
      }, function (err2) {
        if (err2) {
          return callback(err2);
        }

        return callback(null, rawLoc);
      });
    });
  });
};
