var template = require('./template.ejs');
var emitter = require('component-emitter');
var CommentView = require('./Comment');
var ui = require('tresdb-ui');
var rootBus = require('tresdb-bus');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object
  //

  var $mount = null;
  var children = {};
  var $elems = {};
  var bus = rootBus.sub();
  var self = this;
  emitter(self);

  // Helper methods

  var buildComment = function (comment) {
    // Generate comment view and element for a comment object.
    var commentId = comment.id;
    var v = new CommentView(entry, comment);

    children[commentId] = v;

    var commentEl = document.createElement('li');
    commentEl.id = 'comment-' + commentId;
    commentEl.className = 'list-group-item entry-comment';

    var $commentEl = $(commentEl);
    v.bind($commentEl);

    return $commentEl;
  };

  // Public methods

  self.bind = function ($mountEl) {
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

    // On comment creation
    bus.on('location_entry_comment_created', function (ev) {
      // The server sent a new comment.
      // Append to the list of comments.
      var $commentEl = buildComment(ev.data.comment);
      $elems.comments.append($commentEl);
      // Flash in green
      ui.flash($commentEl);
    });

    bus.on('location_entry_comment_changed', function (ev) {
      var commentId = ev.data.commentId;
      if (children[commentId]) {
        children[commentId].update(ev);
      }
    });
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      bus.off();
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
