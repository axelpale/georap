// Component to filter map markers.

var ui = require('georap-ui');
var urls = require('georap-urls-client');
var emitter = require('component-emitter');
var statusListTemplate = require('../Location/StatusType/statusFormList.ejs');
var typeListTemplate = require('../Location/StatusType/typeFormList.ejs');
var template = require('./template.ejs');
var locationTypes = georap.config.locationTypes;
var locationStatuses = georap.config.locationStatuses;
var filterStore = georap.stores.filter;

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self); // Every card must be emitter to be able to detect close

  var updateTemplate = function () {
    var offbtn = $('button#tresdb-filter-off');
    var dot = $('#tresdb-filter-title-dot');

    // Unstyle the previously active
    $('#tresdb-filter-status-list .tresdb-tag-active')
      .removeClass('tresdb-tag-active');
    $('#tresdb-filter-type-list .tresdb-tag-active')
      .removeClass('tresdb-tag-active');

    if (filterStore.isDefault()) {
      // Hide red stuff
      ui.hide(dot);
      offbtn.attr('class', 'btn btn-default disabled');
      // Activate any
      $('#tresdb-filter-status-list .location-filter-any')
        .addClass('tresdb-tag-active');
      $('#tresdb-filter-type-list .location-filter-any')
        .addClass('tresdb-tag-active');
    } else {
      // Show red stuff
      ui.show(dot);
      offbtn.attr('class', 'btn btn-danger');
      // Activate the current status and type buttons
      var filterState = filterStore.get();
      $('#tresdb-filter-status-list .tresdb-status-' + filterState.status)
        .addClass('tresdb-tag-active');
      $('#tresdb-filter-type-list .tresdb-type-' + filterState.type)
        .addClass('tresdb-tag-active');
    }
  };

  // Public methods

  this.bind = function ($mount) {
    var filterState = filterStore.get();
    $mount.html(template({
      // For title dot
      isFilterActive: !filterStore.isDefault(),
      // For any-type button.
      currentStatus: filterState.status,
      currentType: filterState.type,
      // List of available statuses
      statusListHtml: statusListTemplate({
        locationStatuses: locationStatuses,
        currentStatus: filterState.status,
        cap: ui.cap,
      }),
      // List of available types
      typeListHtml: typeListTemplate({
        locationTypes: locationTypes,
        currentType: filterState.type,
        toSymbolUrl: urls.locationTypeToSymbolUrl,
      }),
    }));

    // Click on a status button
    var $statusList = $('#tresdb-filter-status-list');
    $statusList.click(function (ev) {
      var btnValue = ev.target.dataset.status;
      if (typeof btnValue === 'string' && btnValue.length > 0) {
        // Submit status
        filterStore.update({
          status: btnValue,
        });
      }
    });

    // Click on a type button
    var $typeList = $('#tresdb-filter-type-list');
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
      filterStore.reset();
    });

    // Listen changes in filters.
    filterStore.on('updated', updateTemplate);
  };

  this.unbind = function () {
    $('#tresdb-filter-status-list').off();
    $('#tresdb-filter-type-list').off();
    filterStore.off('updated', updateTemplate);
  };
};
