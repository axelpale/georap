/* eslint-disable max-statements */

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

    $('#tresdb-location-story-show').click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      $('#tresdb-location-story-error').addClass('hidden');
      // Hide possible progress bar
      $('#tresdb-location-story-progress').addClass('hidden');
      // Clear the form
      $('#tresdb-location-story-input').val('');

      if ($('#tresdb-location-story-container').hasClass('hidden')) {
        // Show the form
        $('#tresdb-location-story-container').removeClass('hidden');
        $('#tresdb-location-story-form').removeClass('hidden');
        // Focus to input field
        $('#tresdb-location-story-input').focus();
        // Hide others
        $('#tresdb-location-attachment-container').addClass('hidden');
        $('#tresdb-location-visit-container').addClass('hidden');
      } else {
        // Hide
        $('#tresdb-location-story-container').addClass('hidden');
      }

    });

    $('#tresdb-location-story-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-story-container').addClass('hidden');
    });

    $('#tresdb-location-story-form').submit(function (ev) {
      ev.preventDefault();

      var markdown = $('#tresdb-location-story-input').val().trim();

      // console.log('markdown', markdown);

      // If no content, just close the form.
      if (markdown === '') {
        $('#tresdb-location-story-container').addClass('hidden');
        $('#tresdb-location-story-error').addClass('hidden');
        return;
      }

      // Hide the form and show progress bar
      $('#tresdb-location-story-form').addClass('hidden');
      $('#tresdb-location-story-progress').removeClass('hidden');

      locations.createStory(location.getId(), markdown, function (err) {

        // Api responsed. Hide progress bar.
        $('#tresdb-location-story-progress').addClass('hidden');

        // On error, show error message
        if (err) {
          console.error(err);
          $('#tresdb-location-story-error').removeClass('hidden');
          return;
        }

        // Hide the form container
        $('#tresdb-location-story-container').addClass('hidden');
        // Clear the form
        $('#tresdb-location-story-input').val('');
      });
    });


    // Attachment form

    $('#tresdb-location-attachment-show').click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      $('#tresdb-location-attachment-error').addClass('hidden');

      if ($('#tresdb-location-attachment-container').hasClass('hidden')) {
        // Show. Form might also be hidden.
        $('#tresdb-location-attachment-container').removeClass('hidden');
        $('#tresdb-location-attachment-form').removeClass('hidden');
        // Hide others
        $('#tresdb-location-story-container').addClass('hidden');
        $('#tresdb-location-visit-container').addClass('hidden');
      } else {
        // Hide
        $('#tresdb-location-attachment-container').addClass('hidden');
      }

    });

    var attForm = $('#tresdb-location-attachment-form');
    attForm.submit(function (ev) {
      // Prevent page reload
      ev.preventDefault();

      // Hide the upload form and show progress bar.
      attForm.addClass('hidden');
      $('#tresdb-location-attachment-progress').removeClass('hidden');

      locations.createAttachment(location.getId(), attForm, function (err) {
        // Hide progress bar
        $('#tresdb-location-attachment-progress').addClass('hidden');

        if (err) {
          // Show error message
          console.error(err);
          $('#tresdb-location-attachment-error').removeClass('hidden');
        }

        // Success! Hide the upload container but also secretly reveal
        // the previously hidden form.
        $('#tresdb-location-attachment-container').addClass('hidden');
        $('#tresdb-location-attachment-form').removeClass('hidden');
      });
    });

    $('#tresdb-location-attachment-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-attachment-container').addClass('hidden');
    });


    // Visit form

    $('#tresdb-location-visit-show').click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      $('#tresdb-location-visit-error').addClass('hidden');

      if ($('#tresdb-location-visit-container').hasClass('hidden')) {
        // Show
        $('#tresdb-location-visit-container').removeClass('hidden');
        $('#tresdb-location-visit-form').removeClass('hidden');
        // Hide others
        $('#tresdb-location-story-container').addClass('hidden');
        $('#tresdb-location-attachment-container').addClass('hidden');
      } else {
        // Hide
        $('#tresdb-location-visit-container').addClass('hidden');
      }

    });

    $('#tresdb-location-visit-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-visit-container').addClass('hidden');
    });

    $('#tresdb-location-visit-form').submit(function (ev) {
      ev.preventDefault();

      // Hide form but show progress bar
      $('#tresdb-location-visit-form').addClass('hidden');
      $('#tresdb-location-visit-progress').removeClass('hidden');

      var year = $('#tresdb-location-visit-input').val();
      year = parseInt(year, 10);

      locations.createVisit(location.getId(), year, function (err) {
        $('#tresdb-location-visit-progress').addClass('hidden');

        if (err) {
          $('#tresdb-location-visit-error').removeClass('hidden');
          return;
        }

        $('#tresdb-location-visit-container').addClass('hidden');
        $('#tresdb-location-visit-form').removeClass('hidden');
      });
    });
  };

  self.unbind = function () {
    $('#tresdb-location-story-show').off();
    $('#tresdb-location-story-cancel').off();
    $('#tresdb-location-story-form').off();
    $('#tresdb-location-attachment-show').off();
    $('#tresdb-location-attachment-cancel').off();
    $('#tresdb-location-visit-show').off();
    $('#tresdb-location-visit-form').off();
    $('#tresdb-location-visit-cancel').off();
  };
};
