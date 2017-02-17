
var status = require('http-status-codes');

var dal = require('../../../entries/dal');
var uploads = require('./lib/uploads');

exports.create = function (req, res) {

  var locationId = req.locationId;
  var uploadHandler = uploads.uploader.single('locfile');
  var username = req.user.name;

  uploadHandler(req, res, function (err2) {
    if (err2) {
      console.error(err2);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    //
    // console.log('req.file:');
    // console.log(req.file);

    // Upload successful. Append an attachment entry to the location.
    dal.createLocationAttachment({
      locationId: locationId,
      username: username,
      filePathInUploadDir: uploads.getRelativePath(req.file.path),
      fileMimeType: req.file.mimetype,
    }, function (err3) {
      if (err3) {
        console.error(err3);
        return res.sendStatus(status.INTERNAL_SERVER_ERROR);
      }
      return res.sendStatus(status.OK);
    });
  });
};

exports.remove = function (req, res) {
  var locationId = req.locationId;
  var entryId = req.entryId;
  var username = req.user.name;

  dal.removeLocationAttachment({
    locationId: locationId,
    entryId: entryId,
    username: username,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  });
};
