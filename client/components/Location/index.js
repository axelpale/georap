/* eslint-disable max-statements */
// View for location

var emitter = require('component-emitter');
var ui = require('georap-ui');
var LocationModel = require('./Model');
var NameView = require('./Name');
var ThumbnailView = require('./Thumbnail');
var PlacesView = require('./Places');
var GeomView = require('./Geom');
var StatusTypeView = require('./StatusType');
var FormsView = require('./Forms');
var RemoveView = require('./Remove');
var EntriesView = require('./Entries');
var EventsView = require('./Events');

// Templates
var template = require('./template.ejs');
var locations = georap.stores.locations;
var __ = georap.i18n.__;

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
  var $mount = null;
  var self = this;
  var $elems = {};
  var children = {};
  emitter(self);

  // State
  var _location;
  var nameView, placesView, geomView, statusTypeView, formsView;
  var thumbnailView, entriesView, eventsView, removeView;


  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    // Loading
    $mount.html(template({
      // ref: Where the location was referred
      ref: query.ref === 'latest' ? 'latest' : 'map',
      __: __,
    }));

    $elems.loading = $mount.find('.location-loading');

    // Fetch location before rendering.
    locations.getOne(id, function (err, rawLoc) {
      ui.hide($elems.loading);

      if (err) {
        if (err.message && err.message.toLowerCase() === 'not found') {
          console.warn('Location ' + id + ' not found');
          ui.show($mount.find('.location-missing-error'));
          return;
        }
        console.log('error.message', err.message);
        console.table(err);
        console.error(err);
        return;
      }

      // Set state
      _location = new LocationModel(rawLoc);

      nameView = new NameView(_location);
      placesView = new PlacesView(_location);
      geomView = new GeomView(_location);
      statusTypeView = new StatusTypeView(_location);
      thumbnailView = new ThumbnailView(rawLoc);
      formsView = new FormsView(rawLoc);
      entriesView = new EntriesView(rawLoc._id);
      eventsView = new EventsView(_location.getEvents());
      removeView = new RemoveView(_location);

      nameView.bind($('#location-name'));
      placesView.bind($('#location-places'));
      geomView.bind($('#location-geom'));
      statusTypeView.bind($('#location-statustype-container'));
      thumbnailView.bind($('#location-thumbnail-container'));
      formsView.bind($('#location-forms'));
      entriesView.bind($('#location-entries'));
      eventsView.bind($('#location-events'));
      removeView.bind($('#location-remove'));


      // Listen possible changes in the location.

      // Inform parents that view model is removed and view should be closed.
      _location.on('location_removed', function () {
        self.unbind();
        self.emit('removed');
      });

      // Scroll down to possibly referred entry or comment after
      // entries are loaded.
      entriesView.once('idle', function () {
        if (window.location.hash.substring(0, 9) === '#comment-') {
          var layerEl = document.getElementById('card-layer');
          var scrollerEl = layerEl.querySelector('.card-layer-content');
          var commentEl = document.querySelector(window.location.hash);
          // Test if such comment exists
          if (commentEl) {
            // Scroll at comment and leave a small gap.
            var MARGIN = 32;
            scrollerEl.scrollTop = commentEl.offsetTop - MARGIN;
            // Flash the comment in green
            ui.flash($(commentEl));
          }
        }
      });

      // Enable tooltips. See http://getbootstrap.com/javascript/#tooltips
      $('[data-toggle="tooltip"]').tooltip();

      // Inform the view for the location is ready.
      self.emit('idle', _location);

      // Select the location. Leads to creation of the selection marker.
      locations.selectLocation(_location.getMarkerLocation());
    });
  };  // end bind

  self.unbind = function () {
    if ($mount) {
      if (_location) {
        nameView.unbind();
        placesView.unbind();
        geomView.unbind();
        statusTypeView.unbind();
        formsView.unbind();
        thumbnailView.unbind();
        entriesView.unbind();
        eventsView.unbind();
        removeView.unbind();
        _location.off();
        locations.deselectLocation(_location.getId());
      }
      _location = null;
      ui.unbindAll(children);
      children = {};
      $mount.empty();
      $mount = null;
    }
  };

};

module.exports = LocationView;
