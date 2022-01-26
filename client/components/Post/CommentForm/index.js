/* eslint-disable max-statements */

// Form for comment creation and edit
var ui = require('georap-ui');
var emitter = require('component-emitter');
var CommentEditForm = require('./CommentEditForm');
var RemoveView = require('../Remove');
var ErrorView = require('../Error');
var template = require('./template.ejs');
var isExpired = require('../Comments/Comment/isExpired');
var postsApi = georap.stores.posts;
var account = georap.stores.account;
var able = account.able;
var ableOwn = account.ableOwn;
var __ = georap.i18n.__;

var MIN_LEN = georap.config.comments.minMessageLength;
var MAX_LEN = georap.config.comments.maxMessageLength;

module.exports = function (entry, comment) {
  // Parameters
  //   entry
  //     entry object
  //   comment
  //     optional comment object with complete attachments.
  //     Leave empty for comment creation.
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Short alias
  var entryId = entry._id;

  // Comment creation vs comment edit
  var canCreate = false;
  var canUpdate = false;
  var canDelete = false;
  var isNew = false;
  if (comment) {
    isNew = false;
    canCreate = false;
    canUpdate = ableOwn(comment, 'comments-update') && !isExpired(comment);
    canDelete = ableOwn(comment, 'comments-delete');
  } else {
    isNew = true;
    canCreate = able('comments-create');
    canUpdate = false;
    canDelete = false;
  }
  var canAttach = able('attachments-create');

  var submit = function (commentData, callback) {
    if (isNew) {
      postsApi.createComment({
        entryId: entryId,
        markdown: commentData.markdown,
        attachments: commentData.attachments,
      }, callback);
    } else {
      postsApi.changeComment({
        entryId: entryId,
        commentId: comment.id,
        markdown: commentData.markdown,
        attachments: commentData.attachments,
      }, callback);
    }
  };

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      canAttach: canAttach,
      canCreate: canCreate,
      canUpdate: canUpdate,
      canDelete: canDelete,
      __: __,
    }));

    // Cancel button
    $elems.cancel = $mount.find('.comment-form-cancel');
    $elems.cancel.click(function () {
      self.emit('cancel');
    });

    // Init error view
    $elems.error = $mount.find('.comment-form-error');
    children.error = new ErrorView();
    children.error.bind($elems.error);

    // Progress bar
    $elems.progress = $mount.find('.comment-form-progress');

    // Comment deletion button and form
    if (canDelete) {
      $elems.remove = $mount.find('.comment-remove-container');
      $elems.removeOpen = $mount.find('.comment-remove-open');
      $elems.removeOpen.click(function () {
        ui.toggleHidden($elems.remove);
      });

      children.remove = new RemoveView({
        info: __('comment-removal-info'),
      });
      children.remove.bind($elems.remove);
      children.remove.on('cancel', function () {
        ui.hide($elems.remove);
      });
      children.remove.on('submit', function () {
        postsApi.removeComment({
          entryId: entryId,
          commentId: comment.id,
        }, function (err) {
          if (err) {
            children.remove.reset(); // hide progress
            children.error.update(err.message);
            return;
          }
          // Global location_entry_comment_removed will cause unbind
          // and $mount removal.
        });
      });
    }

    // Comment edit form
    if (canCreate || canUpdate) {
      children.edit = new CommentEditForm(entry, comment);
      children.edit.bind($mount.find('.comment-edit-form-container'));

      // If comment has no attachments, attachment form is not open by default.
      // Therefore provide a button to open the form if needed.
      var isEmpty = (!comment || comment.attachments.length === 0);
      if (canAttach && isEmpty) {
        $elems.attachBtn = $mount.find('.comment-form-photo-btn');
        $elems.attachBtn.click(function (ev) {
          ev.preventDefault();
          children.edit.openAttachmentsForm();
          // Hide the button because cannot close attachment form once open.
          ui.hide($elems.attachBtn);
        });
      }

      // Submission
      $elems.formGroup = $mount.find('.comment-form-group');
      $elems.submit = $mount.find('.comment-form-submit');
      $elems.submit.click(function () {
        // Read form
        var commentData = children.edit.getCommentData();

        // Validate
        var len = commentData.markdown.length;
        if (len < MIN_LEN || len > MAX_LEN) {
          // Do not submit if too short or long
          children.error.update(__('comment-bad-length'));
          return;
        }

        // Hide form and reveal progress. This also prevents double click.
        ui.hide($elems.formGroup);
        ui.show($elems.progress);
        // Hide possible previous error messages
        children.error.reset();

        submit(commentData, function (err) {
          // Hide progress
          ui.hide($elems.progress);

          if (err) {
            // Show form again
            ui.show($elems.formGroup);
            // Display error
            children.error.update(err.message);
          } else {
            // Success.
            // End saving drafts and clear any saved drafts.
            children.edit.discardDraft();
            // Inform parent, for example to unbind the form.
            self.emit('success');
          }
        });
      });
    }
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
