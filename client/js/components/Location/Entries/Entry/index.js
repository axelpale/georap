/* eslint-disable max-statements */

var account = require('../../../../stores/account');
var ui = require('../../../lib/ui');
var timestamp = require('../../../lib/timestamp');
var markdownSyntax = require('../../lib/markdownSyntax.ejs');
var template = require('./template.ejs');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Attachment, Story, or Visit model.

  var id = entry.getId();


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
    var $form = $('#' + id + '-form');
    var $progress = $('#' + id + '-progress');
    var $save = $('#' + id + '-save');
    var $syntax = $('#' + id + '-syntax');
    var $syntaxShow = $('#' + id + '-syntax-show');

    var hideErrors = function () {
      // Hide all possible error messages
      ui.hide($deleteError);
      ui.hide($error);
    };

    $edit.click(function (ev) {
      ev.preventDefault();

      console.log('edit-click');

      ui.toggleHidden($container);
      hideErrors();
    });

    $save.click(function (ev) {
      ev.preventDefault();

      ui.show($progress);
      entry.change($form, function (err) {
        ui.hide($progress);

        if (err) {
          ui.show($error);
          return;
        }
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

    $syntaxShow.click(function (ev) {
      ev.preventDefault();

      ui.toggleHidden($syntax);
    });
  };

  this.unbind = function () {

    $('#' + id + '-edit').off();
    $('#' + id + '-save').off();
    $('#' + id + '-cancel').off();
    $('#' + id + '-delete-ensure').off();
    $('#' + id + '-delete').off();
    $('#' + id + '-syntax-show').off();

  };

};
