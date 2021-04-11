// Form for comment creation and edit
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var AttachmentsForm = require('../Form/Attachments');
var updateHint = require('./updateHint');
var template = require('./template.ejs');
var entryApi = tresdb.stores.entries;

var MIN_LEN = tresdb.config.comments.minMessageLength;
var MAX_LEN = tresdb.config.comments.maxMessageLength;

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

  // Comment creation vs comment edit
  var isNew = false;
  if (!comment) {
    isNew = true;
    comment = {
      markdown: '',
      attachments: [],
    };
  }

  var submit = function (markdown, attachments, callback) {
    var locId = entry.locationId;
    var entryId = entry._id;

    if (isNew) {
      entryApi.createComment({
        locationId: locId,
        entryId: entryId,
        markdown: markdown,
        attachments: attachments,
      }, callback);
    } else {
      entryApi.changeComment({
        locationId: locId,
        entryId: entryId,
        commentId: comment.id,
        markdown: markdown,
        attachments: attachments,
      }, callback);
    }
  };

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      isNew: isNew,
      markdown: comment.markdown,
    }));

    // Cancel button
    $elems.cancel = $mount.find('.comment-form-cancel');
    $elems.cancel.click(function () {
      self.emit('exit');
    });

    // Focus to message
    $elems.message = $mount.find('.comment-form-message');
    $elems.message.focus();

    // Setup message hint
    $elems.hint = $mount.find('.comment-form-hint');
    var handleHint = function () {
      var len = $elems.message.val().length;
      updateHint($elems.hint, len);
    };
    handleHint(); // init
    $elems.message.on('input', handleHint); // on text input

    // Delete button
    if (!isNew) {
      children.delete = { unbind: function () {} };
    }

    // Attachment button
    // Show/hide attachments form.
    $elems.attach = $mount.find('.comment-form-attachments-container');
    $elems.attachBtn = $mount.find('.comment-form-photo-btn');
    $elems.attachBtn.click(function () {
      if (children.attach) {
        children.attach.unbind();
        delete children.attach;
        $elems.attach.empty();
      } else {
        children.attach = new AttachmentsForm(comment.attachments);
        children.attach.bind($elems.attach);
      }
    });

    // Prepare progress bar and error for submission
    $elems.progress = $mount.find('.comment-form-progress');
    $elems.error = $mount.find('.comment-form-error');

    // Submit
    $elems.form = $mount.find('.comment-form');
    $elems.submit = $mount.find('.comment-form-submit');
    $elems.submit.click(function () {
      // Read message
      var markdown = $elems.message.val().trim();
      var len = markdown.length;

      if (len < MIN_LEN || len > MAX_LEN) {
        // Do not submit if too short or long
        return;
      }

      // Read attachments
      var attachments = [];
      if (children.attach) {
        attachments = children.attach.getAttachments();
      }

      // TODO Purge cache of unfinished comment

      // Hide form and reveal progress. This also prevents double click.
      ui.hide($elems.form);
      ui.show($elems.progress);
      // Hide possible previous messages
      ui.hide($elems.error);

      submit(markdown, attachments, function (err) {
        // Show form and hide progress
        ui.show($elems.form);
        ui.hide($elems.progress);

        if (err) {
          // Display error
          $elems.error.html(err.message);
          ui.show($elems.error);
        } else {
          // Success.
          // Empty the message input for next comment
          $elems.message.val('');
          // Inform parent for example to unbind the form.
          self.emit('success');
        }
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
