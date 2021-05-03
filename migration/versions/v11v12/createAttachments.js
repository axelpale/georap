const db = require('georap-db');
const keygen = require('georap-key');
const path = require('path');

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
  if (!attachmentData.filepath) {
    return callback(null, []);
  }

  const attachment = {
    key: keygen.generate(),
    user: attachmentData.username,
    time: attachmentData.time,
    deleted: false,
    filename: path.basename(attachmentData.filepath),
    filepath: attachmentData.filepath,
    mimetype: attachmentData.mimetype,
    filesize: attachmentData.filesize,
    thumbfilepath: attachmentData.thumbfilepath,
    thumbmimetype: attachmentData.thumbmimetype,
    data: {}, // For possible future metadata
  };

  db.collection('attachments').insertOne(attachment, (err) => {
    if (err) {
      return callback(err);
    }

    const keys = [attachment.key];
    return callback(null, keys);
  });
};
