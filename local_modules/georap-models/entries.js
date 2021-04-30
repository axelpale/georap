/* eslint-disable no-var */
var entryModel = require('./entry')
var attachmentsModel = require('./attachments')
var dropOne = require('./lib/dropOne')
var forward = require('./lib/forward')
var forwardOne = require('./lib/forwardOne')

var forwardEntry = forwardOne(entryModel, function (entry, ev) {
  return entry._id === ev.data.entryId
})

exports.forward = forward({
  location_entry_changed: forwardEntry,
  location_entry_comment_created: forwardEntry,
  location_entry_comment_changed: forwardEntry,
  location_entry_comment_removed: forwardEntry,

  location_entry_created: function (entries, ev) {
    entries.unshift(ev.data.entry)
  },

  location_entry_removed: function (entries, ev) {
    dropOne(entries, function (entry) {
      return entry._id === ev.data.entryId
    })
  }
})

exports.getAttachments = function (entries) {
  // Return all attachments as array
  //
  var i
  var atts = []

  for (i = 0; i < entries.length; i += 1) {
    atts = atts.concat(entries[i].attachments)
  }

  return atts
}

exports.getImages = function (entries) {
  // Return all image attachments as array
  //
  var atts = exports.getAttachments(entries)
  return attachmentsModel.getImages(atts);
}

exports.getImageEntries = function (entries) {
  // Return entries that have one or more image attachments.
  //
  var i, j, att
  var imgEnts = []
  var HEAD = 6

  for (i = 0; i < entries.length; i += 1) {
    for (j = 0; j < entries[i].attachments.length; j += 1) {
      att = entries[i].attachments[j]
      if (att.mimetype.substr(0, HEAD) === 'image/') {
        imgEnts.push(entries[i])
        break // break inner loop
      }
    }
  }

  return imgEnts
}
