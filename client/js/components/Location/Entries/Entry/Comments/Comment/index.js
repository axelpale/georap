/* eslint-disable max-statements */
var timestamp = require('timestamp');
var template = require('./template.ejs');
var locations = require('../../../../../../stores/locations');

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     Entry model.

  var id = comment.id;
  this.comment = comment;

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      id: id,
      comment: comment,
      timestamp: timestamp,
    }));
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
      $editContainer.toggleClass('hidden');
    });

    $editCancel.click(function (ev) {
      ev.preventDefault();
      $editContainer.addClass('hidden');
    });

    $editForm.submit(function (ev) {
      ev.preventDefault();

      // Trim
      $messageInput.val($messageInput.val().trim());

      var newComment = {
        locationId: entry.getLocationId(),
        entryId: entry.getId(),
        commentId: comment.id,
        newMessage: $messageInput.val(),
      };

      $editForm.addClass('hidden');
      $progress.removeClass('hidden');

      locations.changeComment(newComment, function (err) {
        $progress.addClass('hidden');

        if (err) {
          $editError.removeClass('hidden');
          $editForm.removeClass('hidden');
          return;
        }
      });
    });

    $editCancel.click(function (ev) {
      ev.preventDefault();
      $editContainer.addClass('hidden');
    });

    $deleteButton.click(function (ev) {
      ev.preventDefault();

      $deleteEnsure.toggleClass('hidden');
    });

    $deleteFinal.click(function (ev) {
      ev.preventDefault();

      var locationId = entry.getLocationId();
      var entryId = entry.getId();
      var commentId = comment.id;

      // Hide form
      $editForm.addClass('hidden');

      locations.removeComment(locationId, entryId, commentId, function (err) {
        if (err) {
          console.log(err);
          // Show deletion failed error message
          $deleteError.removeClass('hidden');
        } else {
          $deleteSuccess.removeClass('hidden');
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