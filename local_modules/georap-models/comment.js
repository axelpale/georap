/* eslint-disable no-var */
var forward = require('./lib/forward')

var forwarders = {
  location_entry_comment_changed: function (comment, ev) {
    Object.assign(comment, ev.data.delta)
  }
}

exports.forward = forward(forwarders)

exports.getAgeMs = function (comment) {
  // Comment age in milliseconds
  return Date.now() - (new Date(comment.time)).getTime()
}
