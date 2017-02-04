var db = require('../../services/db');
var shortid = require('shortid');

exports.getOne = function (id, callback) {
  // Get single location
  //
  // Parameters:
  //   id
  //     ObjectId
  //   callback
  //     function (err, loc)
  //       err null and loc null if no loc found
  //

  var coll = db.get().collection('locations');

  coll.findOne({ _id: id }, {}, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};

exports.addAttachment = function (params, callback) {
  // Parameters:
  //   params
  //     object with properties:
  //       locationId
  //         string
  //       userName
  //         string
  //       filePathInUploadDir
  //         string
  //       fileMimeType
  //         string
  //  callback
  //    function (err, newEntry)

  var entry = {
    _id: shortid.generate(),
    time: (new Date()).toISOString(),
    type: 'attachment',
    user: params.userName,
    data: {
      filepath: params.filePathInUploadDir,
      mimetype: params.fileMimeType,
    },
  };

  var coll = db.get().collection('locations');

  var query = { _id: params.locationId };
  var updateq = { $push: { content: entry } };

  coll.updateOne(query, updateq, null, function (err) {
    if (err) {
      return callback(err);
    }

    return callback(null, entry);
  });
};
