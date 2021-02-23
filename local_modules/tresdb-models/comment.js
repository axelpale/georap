/* eslint-disable no-var */
var forward = require('./lib/forward')

var forwarders = {
  location_entry_comment_changed: function (comment, ev) {
    Object.assign(comment, ev.data.delta)
  }
}

exports.forward = forward(forwarders)

exports.isFresh = function (comment) {
  // Return
  //   bool. True if the comment is young enough to be edited.
  //
  var ageMs = Date.now() - (new Date(comment.time)).getTime()
  var maxAgeMs = 3600000
  return ageMs < maxAgeMs
}
