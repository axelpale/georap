/* eslint-disable max-statements */
var template = require('./template.ejs');
var CommentsView = require('./Comments');
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var self = this;

  var id = entry.getId();

  var _commentsView;
  var _entryChangedHandler = null;

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      entry: entry,
      account: account,
      timestamp: ui.timestamp,
      markdownSyntax: ui.markdownSyntax(),
    }));

    var $cancel = $('#' + id + '-cancel');
    var $container = $('#' + id + '-form-container');
    var $deleteButton = $('#' + id + '-delete');  // Final delete button
    var $deleteEnsure = $('#' + id + '-delete-ensure');  // Button
    var $deleteError = $('#' + id + '-delete-error');
    var $deleteFinal = $('#' + id + '-delete-final');  // Container of final
    var $edit = $('#' + id + '-edit');
    var $error = $('#' + id + '-error');
    var $file = $('#' + id + '-file-input');
    var $form = $('#' + id + '-form');
    var $markdown = $('#' + id + '-markdown');
    var $progress = $('#' + id + '-progress');
    var $syntax = $('#' + id + '-syntax');
    var $syntaxShow = $('#' + id + '-syntax-show');
    var $visit = $('#' + id + '-entry-visit');

    var hideErrors = function () {
      // Hide all possible error messages
      ui.hide($deleteError);
      ui.hide($error);
    };

    $edit.click(function (ev) {
      ev.preventDefault();

      ui.toggleHidden($container);
      hideErrors();
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      // Trim
      $markdown.val($markdown.val().trim());

      ui.hide($form);
      ui.show($progress);
      entry.change($form, function (err) {
        ui.hide($progress);

        if (err) {
          ui.show($error);
          ui.show($form);
          return;
        }

        // location_entry_changed from the server event will cause entry rebind
      });
    });

    $cancel.click(function (ev) {
      ev.preventDefault();

      ui.hide($container);
    });

    $deleteEnsure.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($deleteFinal);
    });

    $deleteButton.click(function (ev) {
      ev.preventDefault();

      entry.remove(function (err) {
        ui.hide($container);

        if (err) {
          // Show deletion failed error message
          ui.show($deleteError);
          return;
        }
        // ON successful removal the location will emit
        // location_entry_removed event
      });
    });

    $file.change(function () {
      // If a file is selected, enable visit.
      // If user chooses or changes a file, onchange is fired.
      // See http://stackoverflow.com/a/5670938/638546

      if ($file.val() === '' && !entry.hasFile()) {
        // Disable visit.
        // Prevent user from marking the post as visit.
        $visit.addClass('tresdb-disabled');
        $visit.find('.checkbox').addClass('disabled');
        $visit.find('input[type=checkbox]').prop('checked', false);
        $visit.find('input[type=checkbox]').attr('disabled', 'disabled');
      } else {
        // Enable visit.
        // Enable user to mark the post as visit.
        $visit.removeClass('tresdb-disabled');
        $visit.find('.checkbox').removeClass('disabled');
        $visit.find('input[type=checkbox]').removeAttr('disabled');
      }
    });
    // Trigger once
    $file.change();

    $syntaxShow.click(function (ev) {
      ev.preventDefault();

      ui.toggleHidden($syntax);
    });

    _entryChangedHandler = function () {
      // Rebind
      self.unbind();
      self.bind($mount);
    };
    entry.on('location_entry_changed', _entryChangedHandler);

    _commentsView = new CommentsView(entry);
    _commentsView.bind($mount.find('.entry-comments-container'));
  };

  this.unbind = function () {
    $('#' + id + '-edit').off();
    $('#' + id + '-save').off();
    $('#' + id + '-cancel').off();
    $('#' + id + '-delete-ensure').off();
    $('#' + id + '-delete').off();
    $('#' + id + '-file-input').off();
    $('#' + id + '-syntax-show').off();
    entry.off('location_entry_changed', _entryChangedHandler);
    _commentsView.unbind();
  };

};
