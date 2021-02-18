var emitter = require('component-emitter');
var request = require('./lib/request');

// Init
emitter(exports);

var postJSON = request.postJSON;
var postFile = request.postFile;
var deleteJSON = request.deleteJSON;

exports.createAttachments = function (form, callback) {
  // Create one or more attachments with single upload
  //
  // Parameters:
  //   form
  //     jQuery instance of the file upload form.
  //   callback
  //     function (err, attachments)
  //
  return postFile({
    url: '/api/attachments',
    form: form,
  }, callback);
};

exports.rotateImage = function (key, deg, callback) {
  return postJSON({
    url: '/api/attachments/' + key,
    data: {
      degrees: deg,
    },
  }, callback);
};

exports.removeAttachment = function (key, callback) {
  return deleteJSON({
    url: '/api/attachments/' + key,
    data: {},
  }, callback);
};
