
exports.isImage = function (att) {
  return att.mimetype.substr(0, 6) === 'image/'
}

exports.notImage = function (att) {
  return att.mimetype.substr(0, 6) !== 'image/'
}

exports.getMimeType = function (attachment) {
  // Return null if no file
  return attachment.mimetype
}

exports.getThumbMimeType = function (attachment) {
  // Return null if no file
  return attachment.thumbmimetype
}
