const attachmentDal = require('../../../server/api/attachments/attachment/dal');

module.exports = (attachmentData, callback) => {
  // Parameters
  //   attachmentData, object with keys
  //     username
  //     time
  //     filepath
  //     mimetype
  //     filesize
  //     thumbfilepath
  //     thumbmimetype
  //   callback
  //     function (err, attachmentKeys)
  //
  if (attachmentData.filepath) {
    attachmentDal.create(attachmentData, (err, attachment) => {
      if (err) {
        return callback(err);
      }

      const keys = [attachment.key];
      return callback(null, keys);
    });
  } else {
    return callback(null, []);
  }
};
