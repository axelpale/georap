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
    var offbtn = $('button#georap-filter-off');
    var dot = $('#georap-filter-title-dot');

    // Unstyle the previously active
    $('#georap-filter-status-list .georap-tag-active')
      .removeClass('georap-tag-active');
    $('#georap-filter-type-list .georap-tag-active')
      .removeClass('georap-tag-active');

    if (filterStore.isDefault()) {
      // Hide red stuff
      ui.hide(dot);
      offbtn.attr('class', 'btn btn-default disabled');
      // Activate any
      $('#georap-filter-status-list .location-filter-any')
        .addClass('georap-tag-active');
      $('#georap-filter-type-list .location-filter-any')
        .addClass('georap-tag-active');
    } else {
      // Show red stuff
      ui.show(dot);
      offbtn.attr('class', 'btn btn-danger');
      // Activate the current status and type buttons
      var filterState = filterStore.get();
      $('#georap-filter-status-list .georap-status-' + filterState.status)
        .addClass('georap-tag-active');
      $('#georap-filter-type-list .georap-type-' + filterState.type)
        .addClass('georap-tag-active');
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
        __: georap.i18n.__,
      }),
      // List of available types
      typeListHtml: typeListTemplate({
        locationTypes: locationTypes,
        currentType: filterState.type,
        toSymbolUrl: urls.locationTypeToSymbolUrl,
        __: georap.i18n.__,
      }),
      __: georap.i18n.__,
    }));

    // Click on a status button
    var $statusList = $('#georap-filter-status-list');
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
    var $typeList = $('#georap-filter-type-list');
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
    $('button#georap-filter-off').click(function () {
      filterStore.reset();
    });

    // Listen changes in filters.
    filterStore.on('updated', updateTemplate);
  };

  this.unbind = function () {
    $('#georap-filter-status-list').off();
    $('#georap-filter-type-list').off();
    filterStore.off('updated', updateTemplate);
  };
};
