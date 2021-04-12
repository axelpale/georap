var template = require('./template.ejs');
var entryModel = require('tresdb-models').entry;
var AttachmentsView = require('./Attachments');
var CommentsView = require('./Comments');
var CommentForm = require('./CommentForm');
var CommentButton = require('./CommentButton');
var FormView = require('./Form');
var FormAdminView = require('./FormAdmin');
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object
  //

  var $mount = null;
  var $elems = {};
  var children = {};

  var isAuthor = account.isMe(entry.user);
  var isAdmin = account.isAdmin();
  var isAuthorOrAdmin = (isAuthor || isAdmin);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      entryId: entry._id,
      username: entry.user,
      isAuthorOrAdmin: isAuthorOrAdmin,
      flagstamp: ui.flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time),
      hasMarkdown: entryModel.hasMarkdown(entry),
      markdownHtml: ui.markdownToHtml(entry.markdown),
    }));

    // Attachment viewer
    children.attachments = new AttachmentsView(entry, entry.attachments);
    children.attachments.bind($mount.find('.entry-attachments-container'));

    // Comment list
    children.comments = new CommentsView(entry);
    children.comments.bind($mount.find('.entry-comments-container'));

    // Comment form
    $elems.footer = $mount.find('.entry-footer');
    $elems.commentForm = $mount.find('.comment-form-container');
    children.commentButton = new CommentButton();
    children.commentButton.bind($mount.find('.comment-button-container'));
    children.commentButton.on('open', function () {
      ui.hide($elems.footer);
      ui.show($elems.commentForm);
      children.commentForm = new CommentForm(entry);
      children.commentForm.bind($elems.commentForm);

      // React to cancel button
      children.commentForm.once('exit', function () {
        ui.show($elems.footer);
        ui.hide($elems.commentForm); // contents could be removed but we lazy
        children.commentForm.unbind();
        delete children.commentForm;
      });
      // React to successful form submission
      children.commentForm.once('success', function () {
        ui.show($elems.footer);
        ui.hide($elems.commentForm); // contents could be removed but we lazy
        children.commentForm.unbind();
        delete children.commentForm;
      });
    });

    if (isAuthorOrAdmin) {
      $elems.openBtn = $mount.find('.entry-form-open');
      $elems.openBtn.click(function () {
        var $formContainer = $mount.find('.entry-form-container');
        if (ui.isHidden($formContainer)) {
          ui.show($formContainer);

          if (isAuthor) {
            children.editform = new FormView(entry.locationId, entry);
            children.editform.bind($formContainer);
          } else {
            // The user is non-author admin. Show reduced form.
            children.editform = new FormAdminView(entry.locationId, entry);
            children.editform.bind($formContainer);
          }

          children.editform.once('exit', function () {
            // Close the form if entry not already unbound.
            // For example entry removal might remove the entry view before
            // form exits.
            if ($mount) {
              ui.hide($formContainer);
              children.editform.unbind();
              delete children.editform;
            }
          });
        } else {
          ui.hide($formContainer);
          children.editform.unbind();
          children.editform.off(); // for once
          delete children.editform;
        }
      });
    }
  };

  this.update = function (ev) {
    if ($mount) {
      entryModel.forward(entry, ev);
      var $remount = $mount; // unbind nullifies mount
      this.unbind();
      this.bind($remount);
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
    }
  };
};
