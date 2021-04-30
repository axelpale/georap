var ui = require('tresdb-ui');
var searchApi = tresdb.stores.search;
var geometry = require('georap-models').geometry;
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');

module.exports = function (phrase) {
  // Parameters
  //   phrase
  //     search phrase for the geocode
  var self = this;
  var $mount = null;
  var $elems = {};

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());

    $elems.progress = $mount.find('.search-web-progress');
    $elems.error = $mount.find('.search-web-error');
    $elems.results = $mount.find('.search-web-results');

    ui.show($elems.progress);

    // Fetch geocoder results when map has finished loading.
    searchApi.geocode(phrase, function (err, results) {
      ui.hide($elems.progress);

      if (err) {
        ui.show($elems.error);
        return;
      }

      $elems.results.html(listTemplate({
        // array of { address_components: [ { long_name, short_name }] }
        results: results,
        boundsToZoom: geometry.boundsToZoom,
      }));
    });
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
    }
  };
};
