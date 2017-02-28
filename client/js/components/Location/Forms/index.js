
var locations = require('../../../stores/locations');
var markdownSyntax = require('../lib/markdownSyntax.ejs');
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);

  self.bind = function ($mount) {

    $mount.html(template({
      markdownSyntax: markdownSyntax,
    }));

    var $cont = $('#tresdb-entry-container');
    var $show = $('#tresdb-entry-show');
    var $form = $('#tresdb-entry-form');
    var $error = $('#tresdb-entry-error');
    var $progress = $('#tresdb-entry-progress');
    var $text = $('#tresdb-entry-input');
    var $cancel = $('#tresdb-entry-cancel');
    var $syntax = $('#tresdb-entry-syntax');
    var $syntaxshow = $('#tresdb-entry-syntax-show');

    var responseHandler = function (err) {

      // Api responsed. Hide progress bar.
      $progress.addClass('hidden');

      // On error, show error message
      if (err) {
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
