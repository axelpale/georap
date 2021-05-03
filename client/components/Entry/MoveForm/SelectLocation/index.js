var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var selectedTemplate = require('./selected.ejs');
var throttle = require('georap-throttle');
var locationsApi = tresdb.stores.locations;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  var selectedId = null;
  var selectedName = '';

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({}));

    $elems.results = $mount.find('.location-search-results');
    var renderList = function (locs, phrase) {
      $elems.results.html(listTemplate({
        locations: locs,
        phrase: phrase,
      }));
    };

    $elems.input = $mount.find('.location-search-input');
    var pauseMs = 500;
    $elems.input.on('input', throttle(function (ev, then) {
      var phrase = $elems.input.val().trim();
      $elems.results.html('Loading...');
      locationsApi.search({
        phrase: phrase,
        skip: 0,
        limit: 10,
      }, function (err, result) {
        if (err) {
          $elems.results.html('Error: ' + err.message);
          return;
        }
        renderList(result.locations, phrase);
        // Unlock throttle
        return then();
      });
    }, pauseMs));

    // Display selected item separately near submit buttons
    $elems.selected = $mount.find('.location-search-selected');

    // Handle list selection
    $elems.results.click(function (ev) {
      if (ev.target.dataset.locationId) {
        selectedId = ev.target.dataset.locationId;
        selectedName = ev.target.dataset.locationName;
        // Emphasize selected row
        $elems.results.find('.list-group-item').removeClass('active');
        $(ev.target).addClass('active');
        $elems.selected.html(selectedTemplate({
          id: selectedId,
          name: selectedName,
        }));
        // Inform so that submit button can be enabled
        self.emit('pick', selectedId);
      }
    });
  };

  self.getSelectedLocationId = function () {
    if ($mount) {
      return selectedId;
    }
    return null;
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
