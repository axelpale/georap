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
      comment: comment,
      timestamp: timestamp,
    }));
    var $markdown = $('#' + id + '-comment-markdown');
    var $editContainer = $('#' + id + '-comment-edit-form-container');
    var $editButton = $('#' + id + '-comment-open-edit');
    var $editForm = $('#' + id + '-comment-edit-form');
    var $editCancel = $('#' + id + '-comment-edit-cancel');
    var $editError = $('#' + id + '-comment-edit-error');
    var $deleteButton = $('#' + id + '-comment-delete');  // Final del button
    var $deleteError = $('#' + id + '-comment-delete-error');
    var $deleteEnsure = $('#' + id + '-comment-delete-ensure');  // Button
    var $deleteFinal = $('#' + id + '-comment-delete-final');
    var $progress = $('#' + id + '-progress');

    var hideErrors = function () {
      // Hide all possible error messages
      tresdb.ui.hide($deleteError);
      tresdb.ui.hide($editError);
    };

    $editButton.click(function (ev) {
      ev.preventDefault();

      tresdb.ui.toggleHidden($editContainer);
      hideErrors();
    });

    $editForm.submit(function (ev) {
      ev.preventDefault();

      // Trim
      $markdown.val($markdown.val().trim());

      var newComment = {
        locationId: location.getId(),
        entryId: entry.getId(),
        message: $markdown.val(),
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
