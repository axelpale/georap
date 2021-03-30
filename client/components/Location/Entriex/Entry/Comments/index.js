var template = require('./template.ejs');
var CommentView = require('./Comment');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object
  //

  var $mount = null;
  var children = {};
  var $elems = {};

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

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      entryId: entry._id,
    }));

    // Render comments
    $elems.comments = $mount.find('.entry-comments');
    entry.comments.forEach(function (comment) {
      var $comment = buildComment(comment);
      $elems.comments.append($comment);
    });

    // Setup comment form button
    $elems.open = $mount.find('.entry-comment-form-open');
    $elems.open.click(function () {
      console.log('bind comment form');
    });
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
