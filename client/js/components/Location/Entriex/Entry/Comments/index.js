var template = require('./template.ejs');
var CommentView = require('./Comment');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object
  //

  var children = {};

  // Helper methods

  var buildComment = function (comment) {
    // Generate comment view and element for a comment object.
    var commentId = comment.id;
    var v = new CommentView(entry, comment);

    children[commentId] = v;

    var commentEl = document.createElement('div');
    commentEl.id = 'comment-' + commentId;

    var $commentEl = $(commentEl);
    v.bind($commentEl);

    return $commentEl;
  };

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      entryId: entry._id,
    }));

    var $commentsEl = $mount.find('.entry-comments');

    entry.comments.forEach(function (comment) {
      var $commentEl = buildComment(comment);
      $commentsEl.append($commentEl);
    });
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };
};
