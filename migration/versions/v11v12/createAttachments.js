const dal = require('../../../server/api/attachments/dal');

module.exports = (attachmentData, callback) => {
  // Parameters
  //   attachmentData, object with keys
  //     username
  //     time
  //     filepath
  //     mimetype
  //     thumbfilepath
  //     thumbmimetype
  //   callback
  //     function (err, attachmentKeys)
  //
  if (attachmentData.filepath) {
    dal.create(attachmentData, (err, attachment) => {
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
