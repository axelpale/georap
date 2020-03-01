/* eslint-disable max-statements */
var timestamp = require('timestamp');
var template = require('./template.ejs');
var locations = require('../../../../../../stores/locations');

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     Entry model.

  var id = comment.id;


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
    var $editCancel = $mount.find('#comment-' + id + '-cancel');
    var $editError = $mount.find('#comment-' + id + '-edit-error');
    var $deleteButton = $mount.find('#comment-' + id + '-delete');
    var $deleteError = $mount.find('#comment-' + id + '-delete-error');
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
      var $messageInput = $editForm.find('input.comment-edit');
      $messageInput.val($messageInput.val().trim());

      var newComment = {
        locationId: location.getId(),
        entryId: entry.getId(),
        message: $messageInput.val(),
      };

      tresdb.ui.hide($editForm);
      tresdb.ui.show($progress);

      locations.comment(newComment, function (err) {
        tresdb.ui.hide($progress);

        if (err) {
          tresdb.ui.show($editError);
          tresdb.ui.show($editForm);
          return;
        }
      });
    });

    $editCancel.click(function (ev) {
      ev.preventDefault();

      tresdb.ui.hide($editContainer);
    });

    $deleteEnsure.click(function (ev) {
      ev.preventDefault();
      tresdb.ui.toggleHidden($deleteFinal);
    });

    $deleteButton.click(function (ev) {
      ev.preventDefault();

      var params = {
        locationId: 'foo',
        entryId: 'bar',
        commentId: 'baz',
      };
      locations.removeComment(params, function (err) {
        tresdb.ui.hide($editContainer);

        if (err) {
          // Show deletion failed error message
          tresdb.ui.show($deleteError);
          return;
        }
        // ON successful removal the location will emit
        // location_entry_removed event
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
