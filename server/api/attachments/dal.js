const db = require('tresdb-db');
const path = require('path');
const keygen = require('tresdb-key');

exports.count = (callback) => {
  // Count non-deleted attachments
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('attachments').countDocuments({
    deleted: false,
  })
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
    });
};

exports.create = (params, callback) => {
  // Parameters:
  //   params:
  //     username
  //       string
  //     time
  //       optional ISO datetime string (see db.timestamp). Defaults to now.
  //     filepath
  //       string or null
  //       The relative path of the file in the uploads dir
  //     mimetype
  //       string or null
  //     thumbfilepath
  //       string or null
  //       The relative path of the thumbnail file in the uploads dir
  //     thumbmimetype
  //       string or null
  //   callback
  //     function (err, attachment)
  //

  if (typeof params.filepath !== 'string') {
    // No attachment given
    return callback(new Error('Missing attachment data'));
  }

  const attachment = {
    key: keygen.generate(),
    user: params.username,
    time: params.time ? params.time : db.timestamp(),
    deleted: false,
    filename: path.basename(params.filepath),
    filepath: params.filepath,
    mimetype: params.mimetype,
    thumbfilepath: params.thumbfilepath,
    thumbmimetype: params.thumbmimetype,
    data: {}, // For possible future metadata
  };

  db.collection('attachments').insertOne(attachment, (err) => {
    if (err) {
      // TODO key already exists
      return callback(err);
    }

    return callback(null, attachment);
  });
};

exports.getAll = (callback) => {
  db.collection('attachments').find().toArray(callback);
};

exports.getMany = (keys, callback) => {
  // Multiple attachments with single query.
  //
  // Parameters:
  //   keys: array of attachment keys
  //   callback: function (err, attachments)
  //

  // No need to find none.
  if (!keys || keys.length === 0) {
    return callback(null, []);
  }

  db.collection('attachments').find({
    key: {
      $in: keys,
    },
  }).toArray(callback);
};
