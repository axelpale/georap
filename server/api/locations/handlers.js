
var status = require('http-status-codes');

var dal = require('./dal');
var errors = require('../../errors');
var uploads = require('../../handlers/lib/attachments/uploads');
var prepare = require('./lib/prepare');

exports.getOne = function (req, res) {
  // Fetch single location

  dal.getOne(req.locationId, function (err, rawLoc) {
    if (err) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        error: status.getStatusText(status.INTERNAL_SERVER_ERROR),
      });
    }

    if (!rawLoc) {
      return res.status(status.NOT_FOUND).json({
        error: status.getStatusText(status.NOT_FOUND),
      });
    }

    var loc = prepare.location(rawLoc);

    return res.json(loc);
  });
};

exports.addAttachment = function (req, res) {
  // HTTP request handler

  var locationId = req.locationId;
  var uploadHandler = uploads.uploader.single('locfile');
  var userName = req.user.name;

  uploadHandler(req, res, function (err2) {
    if (err2) {
      console.error(err2);
      return res.json({ error: 'UploadError' });
    }
    //
    // console.log('req.file:');
    // console.log(req.file);

    // Upload successful. Append an attachment entry to the location.
    dal.addAttachment({
      locationId: locationId,
      userName: userName,
      filePathInUploadDir: uploads.getRelativePath(req.file.path),
      fileMimeType: req.file.mimetype,
    }, function (err3, newEntry) {
      if (err3) {
        console.error(err3);
        return res.json(errors.responses.DatabaseError);
      }

      // Send delta event
      return res.json({
        success: {
          type: 'entry_added',
          actor: userName,
          data: {
            locationId: locationId,
            entry: prepare.entry(newEntry),
          },
        },
      });

    });
  });
};
