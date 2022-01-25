// This module bridges batch data to true entries, attachments, and locations.
const uploads = require('../../../services/uploads');
const attachmentDal = require('../../attachments/attachment/dal');
const entriesDal = require('../../posts/dal');
const locationsDal = require('../dal');
const asyn = require('async');
const mime = require('mime');
const path = require('path');
const fs = require('fs');

const NOT_FOUND = 404;

const createAttachment = (args, callback) => {
  // Parameters:
  //   args
  //     username
  //       string
  //     filepath
  //       absolute filepath or URL
  //     mimetype
  //       string, mimetype of the file
  //     overlay
  //       optional overlay object
  //   callback
  //     function (err, attachment) where
  //       attachment
  //         a successfully created attachment object
  //

  // copy the image files and create thumbnails.
  // Might require downloading of URLs.
  uploads.makePermanent(args.filepath, (errp, newPath) => {
    // Parameters:
    //   errp
    //   newPath
    //     string, absolute path to the permanent file location
    //
    if (errp) {
      return callback(errp);
    }

    uploads.createThumbnail({
      path: newPath,
      mimetype: args.mimetype,
    }, (errt, thumb) => {
      if (errt) {
        // TODO what situations cause this error?
        // Should we decide to continue somewhere else?
        // Entry is not created because thumbnail creation has an error.
        return callback(errt);
      }

      // Get filesize
      fs.stat(newPath, (errs, fileStatus) => {
        if (errs) {
          return callback(errs);
        }

        const filesize = fileStatus.size; // bytes

        // Save any captured overlay data for future use.
        let extraData = {};
        if (args.overlay) {
          extraData = {
            overlay: args.overlay,
          };
        }

        // Now, when thumbnail is created, is time to add the
        // file as an attachment.
        // The image paths must be relative to the uploads dir.
        attachmentDal.create({
          username: args.username,
          filepath: uploads.getRelativePath(newPath),
          mimetype: args.mimetype,
          filesize: filesize,
          thumbfilepath: uploads.getRelativePath(thumb.path),
          thumbmimetype: thumb.mimetype,
          data: extraData,
        }, (erra, attachment) => {
          if (erra) {
            return callback(erra);
          }

          return callback(null, attachment);
        });
      });
    });
  });
};

exports.createEntries = (args, callback) => {
  // Parameters:
  //   args
  //     locationId
  //     locationName
  //     username
  //     entries
  //       array of batch entries, where each item is an object with props
  //         filepath
  //         markdown
  //         overlay
  //           optional
  //   callback
  //     function (err)
  //

  asyn.eachSeries(args.entries, (batchEntry, next) => {
    // Null entry.filepath gives mimetype of null.
    // If we do not know the type of the file to download,
    // maybe it is best to not download it.
    const mimetype = mime.getType(batchEntry.filepath);

    if (mimetype === null) {
      entriesDal.createLocationEntry({
        locationId: args.locationId,
        locationName: args.locationName,
        username: args.username,
        markdown: batchEntry.markdown,
        attachments: [],
        flags: [],
      }, next);

      return;
    }

    createAttachment({
      username: args.username,
      filepath: batchEntry.filepath,
      mimetype: mimetype,
      overlay: batchEntry.overlay,
    }, (erra, attachment) => {
      if (erra) {
        // No file found
        if (erra.code === 'ENOENT') {
          const dirname = path.basename(path.dirname(erra.path));
          console.log('Importer: NO_FILE',
                      path.join(dirname, path.basename(erra.path)),
                      'for location', args.locationName);
          return next();
        }

        // File could not be downloaded
        if (erra.name === 'HTTPError' && erra.statusCode === NOT_FOUND) {
          console.log('Importer: HTTP404', erra.url,
                      'for location', args.locationName);
          return next();
        }

        // Some other error
        console.log('Importer: ERROR at createAttachment');
        console.error(erra);
        return next();
      }

      // File in place and attachment created.
      // Time to create the post.
      entriesDal.createLocationEntry({
        locationId: args.locationId,
        locationName: args.locationName,
        username: args.username,
        markdown: batchEntry.markdown,
        attachments: [attachment.key],
        flags: [],
      }, (erre) => {
        if (erre) {
          return next(erre);
        }
        return next();
      });
    });
  }, callback);
};


exports.createLocation = (batchLoc, username, callback) => {
  // Parameters
  //   batchLoc
  //     imported batch location object with properties
  //       name
  //       latitude
  //       longitude
  //       entries
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
    name: batchLoc.name,
    latitude: batchLoc.latitude,
    longitude: batchLoc.longitude,
    username: username,
  }, (errc, rawLoc) => {
    if (errc) {
      return callback(errc);
    }

    exports.createEntries({
      locationId: rawLoc._id,
      locationName: rawLoc.name,
      username: rawLoc.creator,
      entries: batchLoc.entries,
    }, (err1) => {
      if (err1) {
        return callback(err1);
      }

      return callback(null, rawLoc);
    });
  });
};
