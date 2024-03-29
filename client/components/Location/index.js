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
var PostsView = require('./Posts');
var EventsView = require('./Events');
var template = require('./template.ejs');
var locations = georap.stores.locations;
var able = georap.stores.account.able;
var ableOwn = georap.stores.account.ableOwn;
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
    $elems.error = $mount.find('.location-error');

    // Fetch location before rendering.
    locations.getOne(id, function (err, rawLoc) {
      // Ensure that component is bound.
      // When user navigates quickly from location to another
      // then callback might arrive after unbind.
      if (!$mount) {
        return;
      }

      ui.hide($elems.loading);

      if (err) {
        $elems.error.html(err.message);
        ui.show($elems.error);
        console.table(err);
        return;
      }

      // Set state
      _location = new LocationModel(rawLoc);

      children.nameView = new NameView(_location);
      children.nameView.bind($mount.find('.location-name'));

      if (able('locations-statustype')) {
        children.statusType = new StatusTypeView(_location);
        children.statusType.bind($mount.find('.location-statustype'));
      }

      if (able('locations-places')) {
        children.placesView = new PlacesView(_location);
        children.placesView.bind($mount.find('.location-places'));
      }

      if (able('locations-geometry')) {
        children.geomView = new GeomView(_location);
        children.geomView.bind($mount.find('.location-geom'));
      }

      if (able('locations-thumbnail')) {
        children.thumbnail = new ThumbnailView(rawLoc);
        children.thumbnail.bind($mount.find('.location-thumbnail'));
      }

      if (able('posts-create') || able('locations-export-one')) {
        children.formsView = new FormsView(rawLoc);
        children.formsView.bind($mount.find('.location-forms'));
      }

      if (able('posts-read')) {
        children.postsView = new PostsView(rawLoc._id);
        children.postsView.bind($mount.find('.location-posts'));
        // Scroll down to possibly referred post or comment after
        // posts are loaded.
        children.postsView.once('idle', function () {
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
      }

      if (able('locations-events')) {
        children.eventsView = new EventsView(rawLoc._id);
        children.eventsView.bind($mount.find('.location-events'));
      }

      if (ableOwn(rawLoc, 'locations-delete')) {
        children.removeView = new RemoveView(_location);
        children.removeView.bind($mount.find('.location-remove'));
      }

      // Setup back to top link
      $elems.backToTop = $mount.find('.card-back-to-top');
      ui.show($elems.backToTop);
      $elems.backToTop.click(function () {
        var roller = document.querySelector('#card-layer .card-layer-content');
        roller.scrollTop = 0;
      });

      // Listen possible changes in the location.

      // Inform parents that view model is removed and view should be closed.
      _location.on('location_removed', function () {
        self.unbind();
        self.emit('removed');
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
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      if (_location) {
        _location.off();
        locations.deselectLocation(_location.getId());
        _location = null;
      }
      $mount.empty();
      $mount = null;
    }
  };

};

module.exports = LocationView;
