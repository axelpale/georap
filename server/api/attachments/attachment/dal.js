var db = require('tresdb-db');

exports.get = function (key, callback) {
  // Find single attachment
  //
  // Parameters:
  //   key
  //   callback
  //     function (err, attachmentDoc)
  //
  db.collection('attachments').findOne({
    key: key,
  }, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};

exports.change = function (params, callback) {
  // Parameters:
  //   params:
  //     key
  //       attachment key
  //     filepath
  //     mimetype
  //     thumbfilepath
  //     thumbmimetype
  //   callback
  //     function (err)
  //
  var filter = { key: params.key };

  var update = {
    $set: {
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
    },
  };

  db.collection('attachments').updateOne(filter, update, function (err) {
    if (err) {
      return callback(err);
    }
    return callback()
  });
};

exports.remove = function (key, callback) {
  // Parameters:
  //   key
  //     attachment key
  //   callback
  //     function (err)
  //
  db.collection('attachments').deleteOne({
    key: key,
  }, {}, function (err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};
