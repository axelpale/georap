/* eslint-disable max-statements */
// View for location

var emitter = require('component-emitter');

var locations = require('../../stores/locations');

//var getEntryView = require('./lib/getEntryView');
var NameView = require('./Name');
var PlacesView = require('./Places');
var GeomView = require('./Geom');
var TagsView = require('./Tags');
var FormsView = require('./Forms');
var RemoveView = require('./Remove');
var EntriesView = require('./Entries');
var EventsView = require('./Events');

// Templates
var locationTemplate = require('./template.ejs');

module.exports = function (id) {
  // Parameters
  //   id
  //     location id
  //
  // Emits
  //   removed
  //     when model emits "removed"

  // Init
  var self = this;
  emitter(self);

  // State
  var _location;
  var nameView, placesView, geomView, tagsView, formsView;
  var entriesView, eventsView, removeView;


  // Public methods

  self.bind = function ($mount) {

    // Loading
    $mount.html(locationTemplate());

    var $loading = $('#tresdb-location-loading');

    // Fetch location before rendering.
    locations.get(id, function (err, loc) {

      $loading.addClass('hidden');

      if (err) {
        console.error(err);
        return;
      }

      // Set state
      _location = loc;

      nameView = new NameView(_location);
      placesView = new PlacesView(_location);
      geomView = new GeomView(_location);
      tagsView = new TagsView(_location);
      formsView = new FormsView(_location);
      entriesView = new EntriesView(_location.getEntries());
      eventsView = new EventsView(_location.getEvents());
      removeView = new RemoveView(_location);

      nameView.bind($('#tresdb-location-name'));
      placesView.bind($('#tresdb-location-places'));
      geomView.bind($('#tresdb-location-geom'));
      tagsView.bind($('#tresdb-location-tags'));
      formsView.bind($('#tresdb-location-forms'));
      entriesView.bind($('#tresdb-location-entries'));
      eventsView.bind($('#tresdb-location-events'));
      removeView.bind($('#tresdb-location-remove'));


      // Listen possible changes in the location.

      // Inform parents that view model is removed and view should be closed.
      _location.on('location_removed', function () {
        self.unbind();
        self.emit('removed');
      });

      // Enable tooltips. See http://getbootstrap.com/javascript/#tooltips
      $('[data-toggle="tooltip"]').tooltip();

      // Command all external links in entries to open a new tab.
      // See http://stackoverflow.com/a/4425214/638546
      $('#tresdb-location-entries a').filter(function () {
        return this.hostname !== window.location.hostname;
      }).attr('target', '_blank');

      // Inform view is ready
      self.emit('idle', _location);

    });
  };  // end bind

  self.unbind = function () {

    if (_location) {
      nameView.unbind();
      placesView.unbind();
      geomView.unbind();
      tagsView.unbind();
      formsView.unbind();
      entriesView.unbind();
      eventsView.unbind();
      removeView.unbind();
      _location.off();
    }
    _location = null;
  };

};
