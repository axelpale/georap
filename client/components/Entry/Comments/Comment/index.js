var template = require('./template.ejs');
var CommentForm = require('../../CommentForm');
var CommentFormAdmin = require('../../CommentFormAdmin');
var Thumbnail = require('georap-components').Thumbnail;
var commentModel = require('georap-models').comment;
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
      timestamp: ui.timestamp(comment.time),
      isAuthorOrAdmin: isAuthorOrAdmin,
    }));

    // Message
    $elems.message = $mount.find('.comment-message');
    $elems.message.html(ui.markdownToHtml(comment.markdown));

    // Attachment
    $elems.thumb = $mount.find('.comment-attachment-thumbnail');
    if (comment.attachments.length > 0) {
      children.thumb = new Thumbnail(comment.attachments[0], {
        makeLink: true,
      });
      children.thumb.bind($elems.thumb);
    } else {
      ui.hide($elems.thumb);
    }

    if (isAuthorOrAdmin) {
      $elems.form = $mount.find('.comment-edit-container');
      $elems.open = $mount.find('.comment-edit-open');
      $elems.open.click(function () {
        if (children.form) {
          children.form.unbind();
          delete children.form;
          ui.hide($elems.form);
        } else {
          ui.show($elems.form);

          // Do not allow comment to be edited if the comment is old
          // or the user is not the author of the comment.
          var ageMs = commentModel.getAgeMs(comment);
          var maxAgeMs = tresdb.config.comments.secondsEditable * 1000;
          if (isAuthor && ageMs < maxAgeMs) {
            children.form = new CommentForm(entry, comment);
          } else {
            children.form = new CommentFormAdmin(entry, comment);
          }
          children.form.bind($elems.form);

          children.form.once('exit', function () {
            children.form.unbind();
            children.form.off(); // onces
            delete children.form;
            ui.hide($elems.form);
          });
          children.form.once('success', function () {
            children.form.unbind();
            children.form.off(); // onces
            delete children.form;
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
      // Refresh message
      $elems.message.html(ui.markdownToHtml(comment.markdown));
      // Refresh attachment
      if (children.thumb) {
        children.thumb.unbind();
        delete children.thumb;
        ui.hide($elems.thumb);
      }
      if (comment.attachments.length > 0) {
        children.thumb = new Thumbnail(comment.attachments[0], {
          makeLink: true,
        });
        children.thumb.bind($elems.thumb);
        ui.show($elems.thumb);
      }
    }
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
