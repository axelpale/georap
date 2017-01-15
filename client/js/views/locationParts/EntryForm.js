// Templates
var template = require('./entryForm.ejs');
var markdownSyntax = require('./markdownSyntax.ejs');

module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  this.render = function () {
    return template({
      markdownSyntax: markdownSyntax,
    });
  };

  this.bind = function () {
    // Story form

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

      location.addStory(markdown, function (err) {

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
        // Show
        $('#tresdb-location-attachment-container').removeClass('hidden');
        // Hide others
        $('#tresdb-location-story-container').addClass('hidden');
        $('#tresdb-location-visit-container').addClass('hidden');
      } else {
        // Hide
        $('#tresdb-location-attachment-container').addClass('hidden');
      }

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
  };

  this.unbind = function () {
    $('#tresdb-location-story-show').off();
    $('#tresdb-location-story-cancel').off();
    $('#tresdb-location-story-form').off();
    $('#tresdb-location-attachment-show').off();
    $('#tresdb-location-attachment-cancel').off();
    $('#tresdb-location-visit-show').off();
    $('#tresdb-location-visit-cancel').off();
  };
};
