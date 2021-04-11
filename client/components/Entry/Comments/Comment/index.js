var template = require('./template.ejs');
var CommentForm = require('../../CommentForm');
var commentModel = require('tresdb-models').comment;
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     entry object
  //   comment
  //     comment object
  //

  // Setup
  var self = this;
  var $elems = {};
  var children = {};
  var $mount = null;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    var isAuthor = account.isMe(comment.user);
    var isAdmin = account.isAdmin();
    var isAuthorOrAdmin = (isAuthor || isAdmin);

    $mount.html(template({
      author: comment.user,
      htmlMessage: ui.markdownToHtml(comment.markdown),
      timestamp: ui.timestamp(comment.time),
      isAuthor: isAuthor,
      isFresh: commentModel.isFresh(comment),
      isAuthorOrAdmin: isAuthorOrAdmin,
    }));

    if (isAuthorOrAdmin) {
      $elems.form = $mount.find('.comment-edit-container');
      $elems.open = $mount.find('.comment-edit-open');
      $elems.open.click(function () {
        if (children.form) {
          children.form.unbind();
          delete children.form;
          $elems.form.empty();
          ui.hide($elems.form);
        } else {
          ui.show($elems.form);
          children.form = new CommentForm(entry, comment);
          children.form.bind($elems.form);

          children.form.on('exit', function () {
            children.form.unbind();
            delete children.form;
            $elems.form.empty();
            ui.hide($elems.form);
          });
        }
      });
    }
  };

  self.update = function (ev) {
    // Parameters:
    //   ev
    //     a location_entry_comment_changed event
    //
    if ($mount) {
      commentModel.forward(comment, ev);
    }
    // HACK rebind without unbind
    self.bind($mount);
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
      ui.offAll(children);
      ui.unbindAll(children);
      children = {};
    }
  };
};
