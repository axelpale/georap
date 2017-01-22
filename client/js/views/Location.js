// View for location

var emitter = require('component-emitter');
var getEntryView = require('./lib/getEntryView');
var NameView = require('./locationParts/Name');
var CoordsView = require('./locationParts/Coords');
var TagsView = require('./locationParts/Tags');
var EntryFormView = require('./locationParts/EntryForm');
var RemoveView = require('./locationParts/Remove');

// Templates
var locationTemplate = require('./location.ejs');

module.exports = function (location, account, tags) {
  // Parameters
  //   location
  //     models.Location object
  //   account
  //     models.Account object, the current user
  //   tags
  //     models.Tags object
  //
  // Emits
  //   removed
  //     when model emits "removed"

  // Init
  emitter(this);
  var self = this;

  // Build child views

  var nameView = new NameView(location);
  var coordsView = new CoordsView(location);
  var tagsView = new TagsView(location, tags);
  var entryFormView = new EntryFormView(location);
  var removeView = new RemoveView(location);

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
    var coordsHtml = coordsView.render();
    var tagsHtml = tagsView.render();
    var entryFormHtml = entryFormView.render();
    var removeHtml = removeView.render();

    var entriesHtml = entryViews.map(function (entryView) {
      return entryView.render();
    });


    return locationTemplate({
      location: location,
      nameHtml: nameHtml,
      coordsHtml: coordsHtml,
      tagsHtml: tagsHtml,
      entryFormHtml: entryFormHtml,
      entriesHtml: entriesHtml,
      removeHtml: removeHtml,
      account: account,
    });
  };

  this.bind = function () {

    nameView.bind();
    coordsView.bind();
    tagsView.bind();
    entryFormView.bind();
    removeView.bind();

    // Bind children first for clarity
    entryViews.forEach(function (entryView) {
      entryView.bind();
    });

    // Listen possible changes in the location.

    location.on('entry_added', function (ev) {
      // Get entry model
      var entry = location.getEntry(ev.entryId);
      // Create entry view
      var entryView = getEntryView(entry, account);
      // Render, attach to dom and bind handlers
      var html = entryView.render();
      $('#tresdb-location-content-entries').prepend(html);
      entryView.bind();
    });

    location.on('entry_removed', function (ev) {
      $('#' + ev.entryId).remove();
    });

    location.on('removed', function () {
      self.emit('removed');
    });

    // Enable tooltips. See http://getbootstrap.com/javascript/#tooltips
    $('[data-toggle="tooltip"]').tooltip();

  };  // end bind

  this.unbind = function () {
    nameView.unbind();
    coordsView.unbind();
    tagsView.unbind();
    entryFormView.unbind();
    removeView.unbind();
    entryViews.forEach(function (view) {
      view.unbind();
    });
    location.off();
  };

  // Private methods

};
