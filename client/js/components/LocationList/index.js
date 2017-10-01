// Component for location list, a page that lists all search form and results.

var markers = require('../../stores/markers');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template());

    var $results = $('#tresdb-locations-results');

    markers.getFiltered({

    }, function (err, results) {
      // hide progress
      if (err) {
        console.error(err);
        return;
      }

      $results.html(listTemplate({
        markers: results,
      }));
    });
  };  // end bind

  this.unbind = function () {
  };

};
