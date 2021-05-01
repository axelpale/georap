/* eslint-disable no-var */
var bus = require('./lib/bus')
var forward = require('./lib/forward')
var commentsModel = require('./comments')
var attachmentsModel = require('./attachments')

var forwardComments = function (entry, ev) {
  commentsModel.forward(entry.comments, ev)
}

var forwarders = {
  location_entry_changed: function (entry, ev) {
    Object.assign(entry, ev.data.delta)
  },

  location_entry_comment_created: forwardComments,
  location_entry_comment_changed: forwardComments,
  location_entry_comment_removed: forwardComments
}

exports.forward = forward(forwarders)

exports.bus = bus(function (entry, ev) {
  return ev.data && ev.data.entryId === entry._id
})

exports.getId = function (entry) {
  return entry._id
}

exports.getTime = function (entry) {
  return entry.time
}

exports.getUserName = function (entry) {
  return entry.user
}

exports.getLocationId = function (entry) {
  return String(entry.locationId)
}

exports.hasMarkdown = function (entry) {
  return (entry.markdown.length > 0)
}

exports.getMarkdown = function (entry) {
  return entry.markdown
}

exports.hasFile = function (entry) {
  return (entry.attachments.length > 0)
}

exports.getAttachments = function (entry) {
  return entry.attachments
}

exports.getImage = function (entry) {
  // Return first image attachment. Null if none found.
  //
  var HEAD = 6
  var i, att
  for (i = 0; i < entry.attachments.length; i += 1) {
    att = entry.attachments[i]
    if (att.mimetype.substr(0, HEAD) === 'image/') {
      return att
    }
  }
  return null
}

exports.getImages = function (entry) {
  return attachmentsModel.getImages(entry.attachments)
}

exports.getNonImages = function (entry) {
  return attachmentsModel.getNonImages(entry.attachments)
}

exports.getComments = function (entry) {
  return entry.comments
}
