var template = require('./template.ejs');
var emitter = require('component-emitter');
var commentModel = require('georap-models').comment;
var CommentView = require('./Comment');
var DeletedCommentView = require('./DeletedComment');
var ui = require('georap-ui');
var rootBus = require('georap-bus');

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

    var v;
    if (comment.deleted) {
      v = new DeletedCommentView(entry, comment);
    } else {
      v = new CommentView(entry, comment);
    }
    children[commentId] = v;

    var commentEl = document.createElement('li');
    commentEl.id = 'comment-' + commentId;

    if (comment.deleted) {
      commentEl.className = 'list-group-item entry-comment deleted-comment';
    } else {
      commentEl.className = 'list-group-item entry-comment';
    }

    var $commentEl = $(commentEl);
    v.bind($commentEl);

    return $commentEl;
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());

    // Render comments
    $elems.comments = $mount.find('.entry-comments');
    entry.comments.forEach(function (comment) {
      var $comment = buildComment(comment);
      $elems.comments.append($comment);
    });

    // On comment creation
    bus.on('location_entry_comment_created', function (ev) {
      // The server sent a new comment. Append if correct entry.
      if (ev.data.entryId === entry._id) {
        // Append to the list of comments.
        var $commentEl = buildComment(ev.data.comment);
        $elems.comments.append($commentEl);
        // Flash in green
        ui.flash($commentEl);
      }
    });

    bus.on('location_entry_comment_changed', function (ev) {
      var commentId = ev.data.commentId;
      if (children[commentId]) {
        children[commentId].update(ev);
      }
    });

    bus.on('location_entry_comment_removed', function (ev) {
      var commentId = ev.data.commentId;
      if (children[commentId]) {
        children[commentId].unbind();
        delete children[commentId];
        // Switch to another component, quite a HACK.
        // Clone because forward mutates
        var clonedComment = Object.assign({}, ev.data.comment);
        commentModel.forward(clonedComment, ev);
        var $comment = buildComment(clonedComment);
        $mount.find('#comment-' + commentId).replaceWith($comment);
      }
    });
  };

  self.unbind = function () {
    if ($mount) {
      bus.off();
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };
};
