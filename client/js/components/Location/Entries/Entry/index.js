/* eslint-disable max-statements */
require('./style.css');
var account = require('../../../../stores/account');
var timestamp = require('../../../lib/timestamp');
var markdownSyntax = require('../../lib/markdownSyntax.ejs');
var template = require('./template.ejs');
var CommentsView = require('./Comments');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var self = this;

  var id = entry.getId();

  var _commentsView;

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      entry: entry,
      account: account,
      timestamp: timestamp,
      markdownSyntax: markdownSyntax,
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
      tresdb.ui.hide($deleteError);
      tresdb.ui.hide($error);
    };

    $edit.click(function (ev) {
      ev.preventDefault();

      tresdb.ui.toggleHidden($container);
      hideErrors();
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      // Trim
      $markdown.val($markdown.val().trim());

      tresdb.ui.hide($form);
      tresdb.ui.show($progress);
      entry.change($form, function (err) {
        tresdb.ui.hide($progress);

        if (err) {
          tresdb.ui.show($error);
          tresdb.ui.show($form);
          return;
        }

        // location_entry_changed from the server event will cause entry rebind
      });
    });

    $cancel.click(function (ev) {
      ev.preventDefault();

      tresdb.ui.hide($container);
    });

    $deleteEnsure.click(function (ev) {
      ev.preventDefault();
      tresdb.ui.toggleHidden($deleteFinal);
    });

    $deleteButton.click(function (ev) {
      ev.preventDefault();

      entry.remove(function (err) {
        tresdb.ui.hide($container);

        if (err) {
          // Show deletion failed error message
          tresdb.ui.show($deleteError);
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

      tresdb.ui.toggleHidden($syntax);
    });

    entry.on('location_entry_changed', function () {
      // Rebind
      self.unbind();
      self.bind($mount);
    });

    _commentsView = new CommentsView(location, entry);
  };

  this.unbind = function () {

    $('#' + id + '-edit').off();
    $('#' + id + '-save').off();
    $('#' + id + '-cancel').off();
    $('#' + id + '-delete-ensure').off();
    $('#' + id + '-delete').off();
    $('#' + id + '-file-input').off();
    $('#' + id + '-syntax-show').off();
    entry.off();
    _commentsView.off();
  };

};
