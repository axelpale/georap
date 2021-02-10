var db = require('tresdb-db');
var keygen = require('tresdb-key');

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

  const attachment = {
    key: keygen.generate(),
    user: params.username,
    time: db.timestamp(),
    deleted: false,
    filepath: params.filepath,
    mimetype: params.mimetype,
    thumbfilepath: params.thumbfilepath,
    thumbmimetype: params.thumbmimetype,
  };

  db.collection('attachments').insertOne(attachment, (err) => {
    if (err) {
      // TODO key already exists
      return callback(err);
    }
    return callback(null, attachment);
  });
};

exports.getMany = (keys, callback) => {
  // Multiple attachments with single query.
  //
  // Parameters:
  //   keys: array of attachment keys
  //   callback: function (err, attachments)
  //
  db.collection('attachments').find({
    key: {
      $in: keys,
    },
  }).toArray(callback);
};
