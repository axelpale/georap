
var locations = tresdb.stores.locations;
var markdownSyntax = require('../../lib/markdownSyntax.ejs');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');


var K = 1024;

module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);

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
    };

    var submitHandler = function () {
      // Trim
      $text.val($text.val().trim());

      // Hide the form, errors and reveal progress bar
      ui.hide($form);
      ui.hide($error);
      ui.hide($sizeerror);
      ui.show($progress);

      // Post
      locations.createEntry(location.getId(), $form, responseHandler);
    };

    $show.click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      ui.hide($error);
      // Hide possible progress bar
      ui.hide($progress);
      // Clear the form
      $form[0].reset();

      if ($cont.hasClass('hidden')) {
        // Show the form
        ui.show($cont);
        ui.show($form);
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

    $file.change(function () {
      // If a file is selected, enable visit.
      // If user chooses or changes a file, onchange is fired.
      // See http://stackoverflow.com/a/5670938/638546

      if ($file.val() === '') {
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

  };

  self.unbind = function () {
    $('#tresdb-entry-show').off();
    $('#tresdb-entry-form').off();
    $('#tresdb-entry-cancel').off();
    $('#tresdb-entry-syntax-show').off();
  };
};
