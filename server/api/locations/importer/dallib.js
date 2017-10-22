
var uploads = require('../../../services/uploads');
var entriesDal = require('../../entries/dal');
var locationsDal = require('../dal');
var asyn = require('async');
var mime = require('mime');
var path = require('path');


exports.createEntries = function (args, callback) {
  // Parameters:
  //   args
  //     locationId
  //     locationName
  //     username
  //     entries
  //       array of import entries
  //   callback
  //     function (err)
  //

  asyn.eachSeries(args.entries, function (entry, next) {
    // Null entry.filepath gives mimetype of null.
    // If we do not know the type of the file to download,
    // maybe it is best to not download it.
    var mimetype = mime.getType(entry.filepath);

    if (mimetype === null) {
      entriesDal.createLocationEntry({
        locationId: args.locationId,
        locationName: args.locationName,
        username: args.username,
        markdown: entry.markdown,
        isVisit: false,
        filepath: null,
        mimetype: null,
        thumbfilepath: null,
        thumbmimetype: null,
      }, next);

      return;
    }

    // copy the image files and create thumbnails.
    // Might require downloading of URLs.
    uploads.makePermanent(entry.filepath, function (errp, newPath) {
      // Parameters:
      //   errp
      //   newhref
      //     string, absolute path
      //
      if (errp) {
        if (errp.code === 'ENOENT') {
          var dirname = path.basename(path.dirname(errp.path));
          console.log('NO_FILE', path.join(dirname, path.basename(errp.path)),
                      'for location', args.locationName);
          // console.log('file for entry does not exist:', entry);
          return next();
        }

        if (errp.name === 'HTTPError' && errp.statusCode === 404) {
          console.log('HTTP404', errp.url,
                      'for location', args.locationName);
          return next();
        }
        console.log('error at makePermanent');
        console.error(errp);
        return next();
      }

      if (mimetype === null) {
        console.log('Unknown file format', path.basename(newPath));
        return next();
      }

      uploads.createThumbnail({
        path: newPath,
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
          markdown: entry.markdown,
          isVisit: false,
          filepath: uploads.getRelativePath(newPath),
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

    exports.createEntries({
      locationId: rawLoc._id,
      locationName: rawLoc.name,
      username: rawLoc.creator,
      entries: loc.entries,
    }, function (err1) {
      if (err1) {
        return callback(err1);
      }

      return callback(null, rawLoc);
    });
  });
};
