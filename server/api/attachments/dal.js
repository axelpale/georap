var db = require('tresdb-db');
var keygen = require('tresdb-key');

exports.count = function (callback) {
  // Count non-deleted attachments
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('attachments').countDocuments({
    deleted: false,
  })
    .then(function (number) {
      return callback(null, number);
    })
    .catch(function (err) {
      return callback(err);
    });
};

exports.create = function (params, callback) {
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

  var attachment = {
    key: keygen.generate(),
    user: params.username,
    time: timestamp(),
    deleted: false,
    filepath: params.filepath,
    mimetype: params.mimetype,
    thumbfilepath: params.thumbfilepath,
    thumbmimetype: params.thumbmimetype,
  };

  db.collection('attachments').insertOne(attachment, function (err) {
    if (err) {
      // TODO key already exists
      return callback(err);
    }
    return callback(null, attachment);
  });
};
