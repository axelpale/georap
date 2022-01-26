const locationDal = require('../dal');

module.exports = (req, res, next) => {
  // Get all attachments in posts of a location.
  // Attachments are completed with their urls.
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
