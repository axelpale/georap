const getManyComplete = require('../../../posts/dal/getManyComplete');
const attachmentsModel = require('georap-models').attachments;

module.exports = (params, callback) => {
  // Get location entries with their attachments and urls completed.
  //
  // Parameters:
  //   locationId
  //     location id
  //   imagesOnly
  //     optional bool. Set true to include only image attachments.
  //     Default false.
  //
  params = Object.assign({
    imagesOnly: false,
  }, params);

  // NOTE getManyComplete does a bit unnecessary work to preserve
  // structure entries and comments although we only need their attachments.
  // However, the heavy lifting parts are the same and therefore it is
  // a good dry way to get the attachments.
  getManyComplete({
    locationId: params.locationId,
    deleted: false,
  }, {
    skip: 0,
    limit: 100, // meaning: infinity
  }, (err, entries) => {
    if (err) {
      return callback(err);
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
    if (params.imagesOnly) {
      atts = attachmentsModel.getImages(atts);
    }

    return callback(null, atts);
  });
};
