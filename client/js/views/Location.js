/* eslint-disable max-lines */
// View for location

var geostamp = require('./lib/geostamp');
var getEntryView = require('./lib/getEntryView');

// Entry models
var Story = require('../models/entries/Story');

// Templates
var locationTemplate = require('../../templates/forms/location.ejs');
var markdownSyntax = require('../../templates/markdownSyntax.ejs');

module.exports = function (location, account) {
  // Parameters
  //   location
  //     models.Location object
  //   accountModel
  //     models.Account object, the current user

  // Init

  // Build child views
  var entries = location.getEntriesInTimeOrder();
  var entryViews = entries.map(function (entry) {
    return getEntryView(entry, account);
  });

  // Private methods declaration

  // Public methods

  this.render = function () {

    // Sort content, newest first, create-event to bottom.
    //sortEntries(loc.content);

    var entriesHtml = entryViews.map(function (entryView) {
      return entryView.render();
    });

    return locationTemplate({
      location: location,
      geostamp: geostamp,
      entriesHtml: entriesHtml,
      account: account,
      markdownSyntax: markdownSyntax,
    });
  };

  this.bind = function () {

    // Bind children first for clarity
    entryViews.forEach(function (entryView) {
      entryView.bind();
    });

    // Listen possible changes in the location.

    location.on('name_changed', function () {
      var newName = location.getName();
      var s = (newName === '' ? 'Untitled' : newName);
      $('#tresdb-location-name').text(s);
    });

    location.on('entry_added', function (ev) {
      // Create entry model
      var entry = self.getEntry(ev.entryId);
      // Create entry view
      var entryView = getEntryView(entry);
      // Render, attach to dom and bind handlers
      var html = entryView.render();
      $('#tresdb-location-content-entries').prepend(html);
      entryView.bind();
    });

    location.on('entry_removed', function (ev) {
      $('#' + ev.entryId).remove();
    });

    // Enable tooltips. See http://getbootstrap.com/javascript/#tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Rename form

    $('#tresdb-location-rename-show').click(function (ev) {
      ev.preventDefault();

      if ($('#tresdb-location-rename-form').hasClass('hidden')) {
        // Show
        $('#tresdb-location-rename-form').removeClass('hidden');
        // Remove possible error messages
        $('#tresdb-location-rename-error').addClass('hidden');
        // Prefill the form with the current name
        $('#tresdb-location-rename-input').val(location.getName());
        // Focus to input field
        $('#tresdb-location-rename-input').focus();
      } else {
        // Hide
        $('#tresdb-location-rename-form').addClass('hidden');
        // Remove possible error messages
        $('#tresdb-location-rename-error').addClass('hidden');
      }
    });

    $('#tresdb-location-rename-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-rename-form').addClass('hidden');
    });

    $('#tresdb-location-rename-form').submit(function (ev) {
      ev.preventDefault();

      var newName = $('#tresdb-location-rename-input').val().trim();
      var oldName = location.getName();

      if (newName === oldName) {
        // If name not changed, just close the form.
        $('#tresdb-location-rename-form').addClass('hidden');
        $('#tresdb-location-rename-error').addClass('hidden');
        return;
      }

      location.setName(newName, function (err) {
        if (err) {
          console.error(err);
          $('#tresdb-location-rename-form').addClass('hidden');
          $('#tresdb-location-rename-error').removeClass('hidden');
          return;
        }

        $('#tresdb-location-rename-form').addClass('hidden');
      });
    });


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

      console.log('progress bar visible');

      var story = new Story(markdown);

      location.addEntry(story);

      location.save(function (err) {

        console.log('api responsed');

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

  };  // end bind

  // Private methods

};
