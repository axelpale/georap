/* eslint-disable no-var */

exports.getImages = function (attachments) {
  var HEAD = 6
  return attachments.filter(function (at) {
    return at.mimetype.substr(0, HEAD) === 'image/'
  })
}

exports.getNonImages = function (attachments) {
  var HEAD = 6
  return attachments.filter(function (at) {
    return at.mimetype.substr(0, HEAD) !== 'image/'
  })
}
