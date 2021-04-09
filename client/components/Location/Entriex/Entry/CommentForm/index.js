// Form for comment creation and edit
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
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
  //     optional comment object. Leave empty for comment creation.
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

    // Prepare progress bar and error for submission
    $elems.progress = $mount.find('.comment-form-progress');
    $elems.error = $mount.find('.comment-form-error');

    // Submit
    $elems.form = $mount.find('.entry-comment-form');
    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var markdown = $elems.message.val().trim();
      var len = markdown.length;

      if (len < MIN_LEN || len > MAX_LEN) {
        // Do not submit if too short or long
        return;
      }

      // TODO Purge cache of unfinished comment

      // Hide form and reveal progress
      ui.hide($elems.form);
      ui.show($elems.progress);
      // Hide possible previous messages
      ui.hide($elems.error);

      var locId = entry.locationId;
      var entryId = entry._id;
      entryApi.createComment(locId, entryId, markdown, function (err) {
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
