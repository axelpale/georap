/* eslint-disable max-statements */
// View for location

var emitter = require('component-emitter');

var locations = require('../../stores/locations');

//var getEntryView = require('./lib/getEntryView');
var NameView = require('./Name');
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
  emitter(this);
  var self = this;

  // State
  var _location;
  var nameView, geomView, tagsView, formsView;
  var entriesView, eventsView, removeView;


  // Public methods

  this.bind = function ($mount) {

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
      geomView = new GeomView(_location);
      tagsView = new TagsView(_location);
      formsView = new FormsView(_location);
      entriesView = new EntriesView(_location);
      eventsView = new EventsView(_location);
      removeView = new RemoveView(_location);

      nameView.bind($('#tresdb-location-name'));
      geomView.bind($('#tresdb-location-geom'));
      tagsView.bind($('#tresdb-location-tags'));
      formsView.bind($('#tresdb-location-forms'));
      entriesView.bind($('#tresdb-location-entries'));
      eventsView.bind($('#tresdb-location-events'));
      removeView.bind($('#tresdb-location-remove'));


      // Listen possible changes in the location.

      // Inform parents that view model is removed and view should be closed.
      _location.on('removed', function () {
        self.unbind();
        self.emit('removed');
      });

      // Enable tooltips. See http://getbootstrap.com/javascript/#tooltips
      $('[data-toggle="tooltip"]').tooltip();

    });
  };  // end bind

  this.unbind = function () {

    if (_location) {
      nameView.unbind();
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
