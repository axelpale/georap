var request = require('../lib/request');

module.exports = function (id, attachmentKey, callback) {
  // Replaces the current thumbnail.
  //
  // Parameters
  //   id
  //     location id
  //   attachmentKey
  //     string, attachment key of the new thumbnail
  //   callback
  //     function (err)
  //

  // Validate to catch bugs.
  if (typeof attachmentKey !== 'string' || attachmentKey.length === 0) {
    throw new Error('Invalid attachmentKey: ' + attachmentKey);
  }

  return request.postJSON({
    url: '/api/locations/' + id + '/thumbnail',
    data: { attachmentKey: attachmentKey },
  }, callback);
};
