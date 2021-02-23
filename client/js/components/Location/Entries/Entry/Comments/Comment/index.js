/* eslint-disable max-statements */
require('./style.css');
var template = require('./template.ejs');
var ui = require('tresdb-ui');
var account = tresdb.stores.account;
var locations = tresdb.stores.locations;
var MIN_LEN = tresdb.config.comments.minMessageLength;
var MAX_LEN = tresdb.config.comments.maxMessageLength;

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     Entry model.

  var id = comment.id;
  this.comment = comment;

  // Public methods

  this.bind = function ($mount) {

    var isMe = account.isMe(comment.user);
    var isAdmin = account.isAdmin();
    var isOwnerOrAdmin = (isMe || isAdmin);
    var ageMs = Date.now() - (new Date(comment.time)).getTime();
    var maxAgeMs = 3600000;
    var isFresh = ageMs < maxAgeMs;

    var htmlMessage = ui.markdownToHtml(comment.message);

    $mount.html(template({
      id: id,
      comment: comment,
      htmlMessage: htmlMessage,
      timestamp: ui.timestamp,
      isOwner: isMe,
      isFresh: isFresh,
      isOwnerOrAdmin: isOwnerOrAdmin,
    }));

    if (!isOwnerOrAdmin) {
      // Edit form is not shown for non-owners.
      return;
    }

    var $openButton = $mount.find('.comment-edit-open');
    var $editContainer = $mount.find('.comment-edit-form-container');
    var $editForm = $mount.find('#comment-' + id + '-edit-form');
    var $messageInput = $mount.find('#comment-' + id + '-input');
    var $editCancel = $mount.find('#comment-' + id + '-cancel');
    var $editError = $mount.find('#comment-' + id + '-edit-error');
    var $deleteButton = $mount.find('#comment-' + id + '-delete');
    var $deleteError = $mount.find('#comment-' + id + '-delete-error');
    var $deleteSuccess = $mount.find('#comment-' + id + '-delete-success');
    var $deleteEnsure = $mount.find('#comment-' + id + '-delete-ensure');
    var $deleteFinal = $mount.find('#comment-' + id + '-delete-final');
    var $progress = $mount.find('#comment-' + id + '-progress');

    $openButton.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($editContainer);
    });

    $editCancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($editContainer);
    });

    $editForm.submit(function (ev) {
      ev.preventDefault();

      // Trim message field
      $messageInput.val($messageInput.val().trim());
      var newMessage = $messageInput.val();

      // Validate
      if (newMessage.length < MIN_LEN || newMessage.length > MAX_LEN) {
        // Not a valid message.
        return;
      }

      var newComment = {
        locationId: entry.getLocationId(),
        entryId: entry.getId(),
        commentId: comment.id,
        newMessage: newMessage,
      };

      // Hide form but keep the container visible
      ui.hide($editForm);
      ui.show($progress);

      locations.changeComment(newComment, function (err) {
        ui.hide($progress);

        if (err) {
          ui.show($editError);
          $editError.html(err.message);
          ui.show($editForm);
        } else {
          // All good, hide the edit container.
          // Make the form visible for possible future edits.
          ui.hide($editContainer);
          ui.show($editForm);
        }
      });
    });

    $editCancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($editContainer);
    });

    $deleteButton.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($deleteEnsure);
    });

    $deleteFinal.click(function (ev) {
      ev.preventDefault();

      var locationId = entry.getLocationId();
      var entryId = entry.getId();
      var commentId = comment.id;

      // Hide form
      ui.hide($editForm);

      locations.removeComment(locationId, entryId, commentId, function (err) {
        if (err) {
          console.log(err);
          // Show deletion failed error message
          ui.show($deleteError);
          $deleteError.html(err.message);
        } else {
          ui.show($deleteSuccess);
          // ON successful removal the location will emit
          // location_entry_removed event
        }
      });
    });
  };

  this.unbind = function () {
    $('#' + id + '-comment-open-edit').off();
    $('#' + id + '-comment-edit-cancel').off();
    $('#' + id + '-comment-edit-form').off();
    $('#' + id + '-comment-delete').off();
    $('#' + id + '-delete').off();
  };
};
