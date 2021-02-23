/* eslint-disable no-var */

exports.getFileName = function (attachment) {
  // Get filename part of attachment file path.
  //
  // For example if filepath === '/foo/bar/baz.jpg'
  // then getFileName() === 'baz.jpg'
  var p = attachment.filepath
  return p.substr(p.lastIndexOf('/') + 1)
}

exports.getMimeType = function (attachment) {
  // Return null if no file
  return attachment.mimetype
}

exports.getThumbMimeType = function (attachment) {
  // Return null if no file
  return attachment.thumbmimetype
}
