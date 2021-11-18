const db = require('georap-db');

module.exports = (attachmentKey, username, callback) => {
  // Update attachment username.
  //
  // Parameters
  //   attachmentKey
  //     string
  //   username
  //     string
  //   callback
  //     fn (err, num)
  //
  if (typeof attachmentKey !== 'string') {
    throw new Error('Invalid att. key');
  }
  if (typeof username !== 'string') {
    throw new Error('Invalid username');
  }

  db.collection('attachments').findOne({
    key: attachmentKey,
  }, (err, att) => {
    if (err) {
      return callback(err);
    }

    if (!att) {
      // Attachment not found
      console.log('Attachment not found:', attachmentKey);
      return callback(null, 0);
    }

    // Does attachment need repair
    if (att.user !== 'foobar') {
      // Attachment already in shape.
      return callback(null, 0);
    }

    // Update attachment
    db.collection('attachments').updateOne({
      key: attachmentKey,
    }, {
      $set: {
        user: username,
      },
    }, (erru) => {
      if (erru) {
        return callback(erru);
      }

      return callback(null, 1);
    });
  });
};
