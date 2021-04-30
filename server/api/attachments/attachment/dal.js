const path = require('path');
const db = require('georap-db');
const keygen = require('tresdb-key');

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
  }, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};

exports.create = (params, callback) => {
  // Create file attachment document.
  // NOTE The existence of the file is not ensured to enable
  // migration of missing files.
  //
  // Parameters:
  //   params:
  //     username
  //       string
  //     time
  //       optional ISO datetime string (see db.timestamp). Defaults to now.
  //     filepath
  //       string
  //       The relative path of the file in the uploads dir
  //     mimetype
  //       string
  //     filesize
  //       integer, bytes
  //     thumbfilepath
  //       string
  //       The relative path of the thumbnail file in the uploads dir
  //     thumbmimetype
  //       string
  //   callback
  //     function (err, attachment)
  //

  if (typeof params.filepath !== 'string') {
    // No attachment given
    return callback(new Error('Missing attachment filepath'));
  }
  if (typeof params.mimetype !== 'string') {
    return callback(new Error('Missing attachment mimetype'));
  }
  if (typeof params.filesize !== 'number') {
    return callback(new Error('Missing attachment filesize'));
  }

  const attachment = {
    key: keygen.generate(),
    user: params.username,
    time: params.time ? params.time : db.timestamp(),
    deleted: false,
    filename: path.basename(params.filepath),
    filepath: params.filepath,
    mimetype: params.mimetype,
    filesize: params.filesize,
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
  const filter = { key: params.key };

  const update = {
    $set: {
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
    },
  };

  db.collection('attachments').updateOne(filter, update, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
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
  }, {}, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};
