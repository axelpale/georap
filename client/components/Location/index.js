/* eslint-disable max-statements */
// View for location

var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var LocationModel = require('./Model');
var NameView = require('./Name');
var ThumbnailsView = require('./Thumbnails');
var PlacesView = require('./Places');
var GeomView = require('./Geom');
var StatusTypeView = require('./StatusType');
var FormsView = require('./Forms');
var RemoveView = require('./Remove');
var EntriesView = require('./Entriex');
var EventsView = require('./Events');

// Templates
var locationTemplate = require('./template.ejs');
var locations = tresdb.stores.locations;

var LocationView = function (id, query) {
  // Parameters
  //   id
  //     location id
  //   query
  //     url query parameters from router
  //
  // Emits
  //   idle
  //     with a Location
  //     when view is rendered and bound
  //   removed
  //     when model emits "removed"

  // Init
  var self = this;
  emitter(self);

  // State
  var _location;
  var nameView, placesView, geomView, statusTypeView, formsView;
  var thumbnailsView, entriesView, eventsView, removeView;


  // Public methods

  self.bind = function ($mount) {

    // Loading
    $mount.html(locationTemplate({
      // ref: Where the location was referred
      ref: query.ref === 'latest' ? 'latest' : 'map',
    }));

    var $loading = $('#tresdb-location-loading');

    // Fetch location before rendering.
    locations.get(id, function (err, rawLoc) {
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Set state
      _location = new LocationModel(rawLoc);

      nameView = new NameView(_location);
      placesView = new PlacesView(_location);
      geomView = new GeomView(_location);
      statusTypeView = new StatusTypeView(_location);
      formsView = new FormsView(rawLoc);

      thumbnailsView = new ThumbnailsView(rawLoc, rawLoc.entries);
      entriesView = new EntriesView(rawLoc, rawLoc.entries);

      eventsView = new EventsView(_location.getEvents());
      removeView = new RemoveView(_location);

      nameView.bind($('#tresdb-location-name'));
      thumbnailsView.bind($('#tresdb-location-thumbnails'));
      placesView.bind($('#tresdb-location-places'));
      geomView.bind($('#tresdb-location-geom'));
      statusTypeView.bind($('#tresdb-location-statustype-container'));
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

      // Scroll down to possibly referred entry or comment
      // eslint-disable-next-line no-magic-numbers
      if (window.location.hash.substring(0, 9) === '#comment-') {
        var scrollerEl = document.getElementById('card-layer-content');
        var commentEl = document.querySelector(window.location.hash);
        // Test if such comment exists
        if (commentEl) {
          // Scroll at comment and leave a small gap.
          var MARGIN = 32;
          scrollerEl.scrollTop = commentEl.offsetTop - MARGIN;
          // Flash the comment in green
          var $listItem = $(commentEl).find('.list-group-item');
          ui.flash($listItem);
        }
      }

      // Enable tooltips. See http://getbootstrap.com/javascript/#tooltips
      $('[data-toggle="tooltip"]').tooltip();

      // Command all external links in entries to open a new tab.
      // See http://stackoverflow.com/a/4425214/638546
      $('#tresdb-location-entries a').filter(function (i, elem) {
        return elem.hostname !== window.location.hostname;
      }).attr('target', '_blank');

      // Inform the view for the location is ready.
      self.emit('idle', _location);

      // Select the location. Leads to creation of the selection marker.
      locations.selectLocation(_location.getMarkerLocation());
    });
  };  // end bind

  self.unbind = function () {
    if (_location) {
      nameView.unbind();
      placesView.unbind();
      geomView.unbind();
      statusTypeView.unbind();
      formsView.unbind();
      thumbnailsView.unbind();
      entriesView.unbind();
      eventsView.unbind();
      removeView.unbind();
      _location.off();
      locations.deselectLocation(_location.getId());
    }
    _location = null;
  };

};

module.exports = LocationView;
