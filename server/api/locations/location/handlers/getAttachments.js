const locationDal = require('../dal');

module.exports = (req, res, next) => {
  // Get location entries with their attachments and urls completed.
  //
  // Query parameters:
  //   imagesOnly
  //     optional string. Set 'true' to include only image attachments.
  //
  locationDal.getAttachments({
    locationId: req.location._id,
    imagesOnly: (req.query.imagesOnly === 'true'),
  }, (err, attachments) => {
    if (err) {
      return next(err);
    }

    return res.json({
      attachments: attachments,
    });
  });
};
