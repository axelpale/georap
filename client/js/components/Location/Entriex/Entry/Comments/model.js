var models = require('tresdb-models');
var commentModel = require('./Comment/model');

var forwardComment = models.forwardOne(commentModel, function (comment, ev) {
  return comment.id === ev.data.commentId;
});

var forwarders = {
  'location_entry_comment_changed': forwardComment,

  'location_entry_comment_created': function (comments, ev) {
    comments.push(ev.data.comment);
  },

  'location_entry_comment_removed': function (comments, ev) {
    models.drop(comments, function (comment) {
      return comment.id === ev.data.commentId;
    });
  },
};

exports.forward = models.forward(forwarders);
