/* eslint-disable no-var */
var attachmentModel = require('./attachment')

exports.getImages = function (attachments) {
  return attachments.filter(attachmentModel.isImage)
}

exports.getNonImages = function (attachments) {
  return attachments.filter(attachmentModel.notImage)
}
