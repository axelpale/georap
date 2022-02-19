/* eslint-disable no-var */
var forward = require('./lib/forward')

var forwarders = {
  location_entry_comment_changed: function (comment, ev) {
    Object.assign(comment, ev.data.delta)
  },
  location_entry_comment_removed: function (comment, ev) {
    Object.assign(comment, {
      markdown: '', // destroy possibly rough content
      attachments: [], // destroy possibly rough content
      deleted: true, // new prop
      deletedAt: ev.time, // new prop
      deletedBy: ev.user, // new prop
    })
  }
}

exports.forward = forward(forwarders)

exports.getAgeMs = function (comment) {
  // Comment age in milliseconds
  return Date.now() - (new Date(comment.time)).getTime()
}
