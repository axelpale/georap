const getAttachments = require('./getAttachments');
const db = require('georap-db');

module.exports = (locationId, callback) => {
  // Will search a thumbnail among location attachments
  // and update thumbnail to the first available image attachment.
  // NOTE This does not check if thumbnail is already set and will
  // overwrite the selected thumbnail if any.
  // NOTE If no image attachments are available thumbnail is left intact.
  // NOTE No event is stored or emitted.
  //
  // Parameters:
  //   locationId
  //   callback
  //     function (err)
  //

  getAttachments({
    locationId: locationId,
    imagesOnly: true,
  }, (erra, images) => {
    if (erra) {
      return callback(erra);
    }

    if (images.length === 0) {
      // No images available for thumbnail. Success, kind of.
      return callback();
    }

    // Take the first image attachment as the first thumbnail
    const image = images[0];

    const q = { _id: locationId };
    const u = {
      $set: {
        thumbnail: image.key,
      },
    };

    db.collection('locations').updateOne(q, u, (err) => {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  });
};
