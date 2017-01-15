// View for location

var geostamp = require('./lib/geostamp');
var getEntryView = require('./lib/getEntryView');
var NameView = require('./locationParts/Name');
var TagsView = require('./locationParts/Tags');

// Entry models
var Story = require('../models/entries/Story');

// Templates
var locationTemplate = require('../../templates/forms/location.ejs');
var markdownSyntax = require('../../templates/markdownSyntax.ejs');

module.exports = function (location, account, tags) {
  // Parameters
  //   location
  //     models.Location object
  //   account
  //     models.Account object, the current user
  //   tags
  //     models.Tags object

  // Init

  // Build child views

  var nameView = new NameView(location);

  var tagsView = new TagsView(location, tags);

  var entries = location.getEntriesInTimeOrder();
  var entryViews = entries.map(function (entry) {
    return getEntryView(entry, account);
  });

  // Private methods declaration

  // Public methods

  this.render = function () {

    // Sort content, newest first, create-event to bottom.
    //sortEntries(loc.content);

    var nameHtml = nameView.render();
    var tagsHtml = tagsView.render();

    var entriesHtml = entryViews.map(function (entryView) {
      return entryView.render();
    });

    return locationTemplate({
      location: location,
      geostamp: geostamp,
      nameHtml: nameHtml,
      tagsHtml: tagsHtml,
      entriesHtml: entriesHtml,
      account: account,
      markdownSyntax: markdownSyntax,
    });
  };

  this.bind = function () {

    nameView.bind();
    tagsView.bind();

    // Bind children first for clarity
    entryViews.forEach(function (entryView) {
      entryView.bind();
    });

    // Listen possible changes in the location.

    location.on('entry_added', function (ev) {
      // Get entry model
      var entry = location.getEntry(ev.entryId);
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

  this.unbind = function () {
    nameView.unbind();
    tagsView.unbind();
    entryViews.forEach(function (view) {
      view.unbind();
    });
    location.off();

    $('#tresdb-location-story-show').off();
    $('#tresdb-location-story-cancel').off();
    $('#tresdb-location-story-form').off();
    $('#tresdb-location-attachment-show').off();
    $('#tresdb-location-attachment-cancel').off();
    $('#tresdb-location-visit-show').off();
    $('#tresdb-location-visit-cancel').off();
  };

  // Private methods

};
