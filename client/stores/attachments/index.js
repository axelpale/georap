var emitter = require('component-emitter');
var request = require('../lib/request');

// Init
emitter(exports);

exports.createAttachments = function (form, callback) {
  // Create one or more attachments with single upload
  //
  // Parameters:
  //   form
  //     jQuery instance of the file upload form.
  //   callback
  //     function (err, attachments)
  //
  return request.postFile({
    url: '/api/attachments',
    form: form,
  }, callback);
};

exports.rotateImage = function (key, deg, callback) {
  // Parameters:
  //   key
  //     attachment key
  //   deg
  //     integer, rotation in degrees
  //   callback
  //     function (err, updatedAttachment)
  //
  return request.postJSON({
    url: '/api/attachments/' + key,
    data: {
      degrees: deg,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }
    return callback(null, response.attachment);
  });
};

exports.removeAttachment = function (key, callback) {
  return request.deleteJSON({
    url: '/api/attachments/' + key,
    data: {},
  }, callback);
};
