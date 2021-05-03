/* eslint-disable no-var */
var dropOne = require('./lib/dropOne')
var forward = require('./lib/forward')
var forwardOne = require('./lib/forwardOne')
var commentModel = require('./comment')

var forwardComment = forwardOne(commentModel, function (comment, ev) {
  return comment.id === ev.data.commentId
})

var forwarders = {
  location_entry_comment_changed: forwardComment,

  location_entry_comment_created: function (comments, ev) {
    comments.push(ev.data.comment)
  },

  location_entry_comment_removed: function (comments, ev) {
    dropOne(comments, function (comment) {
      return comment.id === ev.data.commentId
    })
  }
}

exports.forward = forward(forwarders)
