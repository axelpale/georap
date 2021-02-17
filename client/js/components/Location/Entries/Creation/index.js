/* eslint-disable max-statements */
var account = tresdb.stores.account;
var locations = tresdb.stores.locations;
var markdownSyntax = require('../../lib/markdownSyntax.ejs');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');

// Kilobyte
var K = 1024;

// Temporary storage for unfinished entries.
// Remembers input even if user closes the location card.
// A mapping from location id to { markdown, username }
// We do not save file input nor visit checkbox because
// file input cannot be set programmatically (security issue).
var entryInputSaver = {};

module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);
  var locationId = location.getId();
  var username = account.getName();

  self.bind = function ($mount) {

    $mount.html(template({
      markdownSyntax: markdownSyntax,
      limit: Math.round(tresdb.config.uploadSizeLimit / (K * K)),
    }));

    var $cancel = $('#tresdb-entry-cancel');
    var $cont = $('#tresdb-entry-container');
    var $show = $('#tresdb-entry-show');
    var $error = $('#tresdb-entry-error');
    var $file = $('#tresdb-entry-file-input');
    var $form = $('#tresdb-entry-form');
    var $progress = $('#tresdb-entry-progress');
    var $sizeerror = $('#tresdb-entry-sizeerror');
    var $syntax = $('#tresdb-entry-syntax');
    var $syntaxshow = $('#tresdb-entry-syntax-show');
    var $text = $('#tresdb-entry-input');
    var $visit = $('#tresdb-entry-visit');
    var $visitinput = $('#tresdb-entry-visit-input');

    var responseHandler = function (err) {

      // Api responsed. Hide progress bar.
      ui.hide($progress);

      // On error, show error message
      if (err) {
        if (err.name === 'REQUEST_TOO_LONG') {
          ui.show($form);
          ui.show($sizeerror);
          return;
        }
        console.error(err);
        ui.show($error);
        return;
      }

      // Hide the form container
      ui.hide($cont);
      // Clear the form
      $form[0].reset();
      // Clear saved state
      entryInputSaver[locationId] = null;
    };

    var submitHandler = function () {
      // Trim
      $text.val($text.val().trim());

      // Hide the form, errors and reveal progress bar
      ui.hide($form);
      ui.hide($error);
      ui.hide($sizeerror);
      ui.show($progress);

      var entryData = {
        markdown: $text.val(),
        attachments: [], // TODO
        flags: $visitinput.prop('checked') ? ['visit'] : [], // TODO from cfg
      };

      // Post
      locations.createEntry(locationId, entryData, responseHandler);
    };

    var fileChangeHandler = function () {
      // If a file is selected, enable visit.
      // If user chooses or changes a file, onchange is fired.
      // See http://stackoverflow.com/a/5670938/638546

      if ($file.val() === '') {
        // Disable visit.
        // Prevent user from marking the post as visit.
        $visit.addClass('tresdb-disabled');
        $visit.find('.checkbox').addClass('disabled');
        $visitinput.prop('checked', false);
        $visitinput.attr('disabled', 'disabled');
      } else {
        // Enable visit.
        // Enable user to mark the post as visit.
        $visit.removeClass('tresdb-disabled');
        $visit.find('.checkbox').removeClass('disabled');
        $visitinput.removeAttr('disabled');
      }
    };

    $show.click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      ui.hide($error);
      // Hide possible progress bar
      ui.hide($progress);
      // Clear the form
      $form[0].reset();
      // Ensure correct visit checkbox state after form clear.
      fileChangeHandler();

      if ($cont.hasClass('hidden')) {
        // Show the form
        ui.show($cont);
        ui.show($form);

        // Prefill with possibly previously saved values
        var savedInput = entryInputSaver[locationId];
        if (savedInput) {
          // Prevent case where user logs out and another logs in.
          if (savedInput.username === username) {
            $text.val(savedInput.markdown);
            // Setting file input is not possible due to browser security.
            // $file.val(savedInput.filepath);
          }
        }

        // Focus to input field
        $text.focus();
      } else {
        // Hide
        ui.hide($cont);
      }
    });

    $syntaxshow.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($syntax);
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($cont);
    });

    $form.submit(function (ev) {
      ev.preventDefault();
      submitHandler();
    });

    $file.change(fileChangeHandler);

    $text.on('input', function () {
      entryInputSaver[locationId] = {
        username: username,
        markdown: $text.val(),
      };
    });
  };

  self.unbind = function () {
    $('#tresdb-entry-show').off();
    $('#tresdb-entry-form').off();
    $('#tresdb-entry-cancel').off();
    $('#tresdb-entry-syntax-show').off();
  };
};
