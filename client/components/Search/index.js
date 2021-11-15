// Component for search form and results.

var FormView = require('./Form');
var GeocodeView = require('./Geocode');
var LocationsView = require('./Locations');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var queryString = require('query-string');
var ui = require('georap-ui');

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring, with props
  //       skip: <number>
  //       limit: <number>
  //       order: 'rel' | 'az' | 'za' | 'newest' | 'oldest'
  //       text: <text>

  // Init
  var self = this;
  emitter(self);
  var $mount = null;
  var children = {};
  var $elems = {};

  // Sanitize query
  if (query.skip) {
    query.skip = parseInt(query.skip, 10);
  }
  if (query.limit) {
    query.limit = parseInt(query.limit, 10);
  }

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    children.form = new FormView(query);
    children.form.bind($mount.find('.search-form-container'));

    // Place search; Get results from web
    children.geocode = new GeocodeView(query.text);
    children.geocode.bind($mount.find('.search-geocode-container'));

    // Location search; Get results from database
    children.locations = new LocationsView(query);
    children.locations.bind($mount.find('.search-locations-container'));

    // Handle form submit
    children.form.on('submit', function (queryObj) {
      // Reload view with new url.
      georap.go('/search?' + queryString.stringify(queryObj));
      // HACK update the search bar content in menu
      $('#tresdb-mainmenu-search-text').val(queryObj.text);
    });
    // Handle next/prev navigation
    children.locations.on('submit', function (queryObj) {
      // Reload view with new url.
      georap.go('/search?' + queryString.stringify(queryObj));
    });
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      ui.offAll($elems);
    }
  };
};
