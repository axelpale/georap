
var locations = require('../../../../stores/locations');
var markdownSyntax = require('../../lib/markdownSyntax.ejs');
var template = require('./template.ejs');
var emitter = require('component-emitter');


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

    var responseHandler = function (err) {

      // Api responsed. Hide progress bar.
      $progress.addClass('hidden');

      // On error, show error message
      if (err) {
        if (err.name === 'REQUEST_TOO_LONG') {
          $form.removeClass('hidden');
          $sizeerror.removeClass('hidden');
          return;
        }
        console.error(err);
        $error.removeClass('hidden');
        return;
      }

      // Hide the form container
      $cont.addClass('hidden');
      // Clear the form
      $form[0].reset();
    };

    var submitHandler = function () {
      // Trim
      $text.val($text.val().trim());

      // Hide the form, errors and reveal progress bar
      $form.addClass('hidden');
      $error.addClass('hidden');
      $sizeerror.addClass('hidden');
      $progress.removeClass('hidden');

      // Post
      locations.createEntry(location.getId(), $form, responseHandler);
    };

    $show.click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      $error.addClass('hidden');
      // Hide possible progress bar
      $progress.addClass('hidden');
      // Clear the form
      $form[0].reset();

      if ($cont.hasClass('hidden')) {
        // Show the form
        $cont.removeClass('hidden');
        $form.removeClass('hidden');
        // Focus to input field
        $text.focus();
      } else {
        // Hide
        $cont.addClass('hidden');
      }
    });

    $syntaxshow.click(function (ev) {
      ev.preventDefault();
      $syntax.toggleClass('hidden');
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      $cont.addClass('hidden');
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
    var $show = $('#tresdb-entry-show');
    var $form = $('#tresdb-entry-form');
    var $cancel = $('#tresdb-entry-cancel');
    var $syntaxshow = $('#tresdb-entry-syntax-show');

    $show.off();
    $form.off();
    $cancel.off();
    $syntaxshow.off();
  };
};
