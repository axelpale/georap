// Component to filter map markers.

var urls = require('tresdb-urls');
var emitter = require('component-emitter');
var typeListTemplate = require('../Location/StatusType/typeFormList.ejs');
var template = require('./template.ejs');
var locationTypes = tresdb.config.locationTypes;
var filterStore = tresdb.stores.filter;

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(this); // Every card must be emitter to be able to detect close

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      // For any-type button.
      currentType: filterStore.get().type,
      // List of available types
      typeListHtml: typeListTemplate({
        locationTypes: locationTypes,
        currentType: filterStore.get().type,
        toSymbolUrl: urls.locationTypeToSymbolUrl,
      }),
    }));

    var $typeList = $('#tresdb-filter-type-list');

    // Click on a type button
    $typeList.click(function (ev) {
      var btnValue = ev.target.dataset.type;
      if (typeof btnValue === 'string' && btnValue.length > 0) {
        // Submit type
        filterStore.update({
          type: btnValue,
        });
        // Refresh
        self.unbind();
        self.bind($mount);
      }
    });
  };

  this.unbind = function () {
    $('#tresdb-filter-type-list').off();
  };
};
