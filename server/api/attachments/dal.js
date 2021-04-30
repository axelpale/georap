const db = require('georap-db');
const urls = require('georap-urls-server');

exports.count = (callback) => {
  // Count non-deleted attachments
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('attachments')
    .countDocuments({ deleted: false })
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
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
  }).toArray((err, attachments) => {
    if (err) {
      return callback(err);
    }

    // Sort by given keys
    const sorted = keys.map(k => attachments.find(a => a.key === k));
    return callback(null, sorted);
  });
};

exports.getManyComplete = (keys, callback) => {
  // Multiple attachments with urls with single query.
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
  }).toArray((err, attachments) => {
    if (err) {
      return callback(err);
    }

    // Sort by given keys
    const sorted = keys.map(k => attachments.find(a => a.key === k));
    const attachmentsWithUrls = sorted.map(urls.completeAttachment);

    return callback(null, attachmentsWithUrls);
  });
};
