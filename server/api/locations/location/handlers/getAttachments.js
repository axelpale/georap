const getManyComplete = require('../../../entries/dal/getManyComplete');
const attachmentsModel = require('georap-models').attachments;

module.exports = (req, res, next) => {
  // Get location entries with their attachments and urls completed.
  //
  // Query parameters:
  //   imagesOnly
  //     optional string. Set 'true' to include only image attachments.

  const imagesOnly = (req.query.imagesOnly === 'true');

  // NOTE getManyComplete does a bit unnecessary work to preserve
  // structure entries and comments although we only need their attachments.
  // However, the heavy lifting parts are the same and therefore it is
  // a good dry way to get the attachments.
  getManyComplete({
    locationId: req.location._id,
    deleted: false,
  }, {
    // NOTE skip and limit already validated by middleware
    skip: 0,
    limit: 100, // meaning: infinity
  }, (err, entries) => {
    if (err) {
      return next(err);
    }

    // Collect attachments
    let atts = [];
    entries.forEach((entry) => {
      atts = atts.concat(entry.attachments);
      entry.comments.forEach((comment) => {
        atts = atts.concat(comment.attachments);
      });
    });

    // Filter images if so requested
    if (imagesOnly) {
      atts = attachmentsModel.getImages(atts);
    }

    return res.json({
      attachments: atts,
    });
  });
};
