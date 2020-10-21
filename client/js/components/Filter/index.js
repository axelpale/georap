// Component to filter map markers.

var ui = require('tresdb-ui');
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
  emitter(self); // Every card must be emitter to be able to detect close

  var updateTemplate = function () {
    var offbtn = $('button#tresdb-filter-off');
    var dot = $('#tresdb-filter-title-dot');
    if (filterStore.isActive()) {
      // Show red stuff
      ui.show(dot);
      offbtn.attr('class', 'btn btn-danger');
      // Unstyle the previously active
      $('#tresdb-filter-type-list .tresdb-tag-active')
        .removeClass('tresdb-tag-active');
      // Activate the current type button
      var type = filterStore.get().type;
      $('#tresdb-filter-type-list .tresdb-type-' + type)
        .addClass('tresdb-tag-active');
    } else {
      // Hide red stuff
      ui.hide(dot);
      offbtn.attr('class', 'btn btn-default disabled');
      // Unstyle the previously active types
      $('#tresdb-filter-type-list .tresdb-tag-active')
        .removeClass('tresdb-tag-active');
      // Activate any
      $('#tresdb-filter-type-list .tresdb-filter-any')
        .addClass('tresdb-tag-active');
    }
  };

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      // For title dot
      isFilterActive: filterStore.isActive(),
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
      }
    });

    // Click on off button
    $('button#tresdb-filter-off').click(function () {
      filterStore.deactivate();
    });

    // Listen changes in filters.
    filterStore.on('updated', updateTemplate);
  };

  this.unbind = function () {
    $('#tresdb-filter-type-list').off();
    filterStore.off('updated', updateTemplate);
  };
};
