

// var dal = require('../../../entries/dal');
// var uploads = require('./lib/uploads');

var status = require('http-status-codes');

// var THUMB_SIZE = 568;

exports.create = function (req, res) {

  // var locationId = req.location._id;
  // var locationName = req.location.name;
  // var uploadHandler = uploads.uploader.single('locfile');
  // var username = req.user.name;
  //
  // uploadHandler(req, res, function (err2) {
  //   if (err2) {
  //     console.error(err2);
  //     return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  //   }
  //   //
  //   // console.log('req.file:');
  //   // console.log(req.file);
  //
  //   uploads.createThumbnail(req.file, THUMB_SIZE, function (err3, thumb) {
  //     if (err3) {
  //       console.error(err3);
  //       return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  //     }
  //
  //     // Upload successful. Append an attachment entry to the location.
  //     dal.createLocationAttachment({
  //       locationId: locationId,
  //       locationName: locationName,
  //       username: username,
  //       filePathInUploadDir: uploads.getRelativePath(req.file.path),
  //       fileMimeType: req.file.mimetype,
  //       thumbPathInUploadDir: uploads.getRelativePath(thumb.path),
  //       thumbMimeType: thumb.mimetype,
  //     }, function (err4) {
  //       if (err4) {
  //         console.error(err4);
  //         return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  //       }
  //       return res.sendStatus(status.OK);
  //     });
  //   });
  // });
  return res.sendStatus(status.OK);
};

exports.remove = function (req, res) {
  // var locationId = req.location._id;
  // var locationName = req.location.name;
  // var entryId = req.entryId;
  // var username = req.user.name;
  //
  // dal.removeLocationAttachment({
  //   locationId: locationId,
  //   locationName: locationName,
  //   entryId: entryId,
  //   username: username,
  // }, function (err) {
  //   if (err) {
  //     console.error(err);
  //     return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  //   }
  //   return res.sendStatus(status.OK);
  // });
  return res.sendStatus(status.OK);
};
