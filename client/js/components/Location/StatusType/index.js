// Tools
var urls = require('tresdb-urls');
var cap = require('./cap');
// Templates
var template = require('./template.ejs');
var statusTypeTemplate = require('./statusType.ejs');
var statusFormListTemplate = require('./statusFormList.ejs');
var typeFormListTemplate = require('./typeFormList.ejs');
// Config
var locationStatuses = tresdb.config.locationStatuses;
var locationTypes = tresdb.config.locationTypes;

module.exports = function (location) {
  var self = this;

  this.bind = function ($mount) {
    $mount.html(template({
      // The current status and type
      statusTypeHtml: statusTypeTemplate({
        currentStatus: location.getStatus(),
        currentType: location.getType(),
        toSymbolUrl: urls.locationTypeToSymbolUrl,
        defaultType: locationTypes[0],
        cap: cap,
      }),
      // List of available statuses
      statusFormListHtml: statusFormListTemplate({
        locationStatuses: locationStatuses,
        currentStatus: location.getStatus(),
        cap: cap,
      }),
      // List of available types
      typeFormListHtml: typeFormListTemplate({
        locationTypes: locationTypes,
        currentType: location.getType(),
        toSymbolUrl: urls.locationTypeToSymbolUrl,
      }),
    }));

    var $show = $('#tresdb-location-statustype-form-show');
    var $form = $('#tresdb-location-statustype-form');
    var $cancel = $('#tresdb-location-statustype-form-cancel');
    var $progress = $('#tresdb-location-statustype-form-progress');
    var $error = $('#tresdb-location-statustype-form-error');
    var $statusList = $('#tresdb-location-status-list');
    var $typeList = $('#tresdb-location-type-list');

    // Update if status or type is changed externally.
    location.on('location_status_changed', function () {
      $mount.empty();
      self.unbind(); // without unbind, exponential growth in num of calls
      self.bind($mount);
    });
    location.on('location_type_changed', function () {
      $mount.empty();
      self.unbind(); // without unbind, exponential growth in num of calls
      self.bind($mount);
    });

    // Form toggle
    $show.click(function (ev) {
      ev.preventDefault();

      // Remove possible previous error messages
      $error.addClass('hidden');

      if ($form.hasClass('hidden')) {
        // Show
        $form.removeClass('hidden');
      } else {
        // Hide
        $form.addClass('hidden');
      }
    });

    // Form cancel
    $cancel.click(function (ev) {
      ev.preventDefault();
      $form.addClass('hidden');
    });

    var submitStatus = function (newStatus) {
      $progress.removeClass('hidden');
      $form.addClass('hidden');

      location.setStatus(newStatus, function (err) {
        $progress.addClass('hidden');

        if (err) {
          console.error(err);
          // Show error message
          $error.removeClass('hidden');
          return;
        }
        // Everything ok
      });
    };

    var submitType = function (newType) {
      $progress.removeClass('hidden');
      $form.addClass('hidden');

      location.setType(newType, function (err) {
        $progress.addClass('hidden');

        if (err) {
          console.error(err);
          // Show error message
          $error.removeClass('hidden');
          return;
        }
        // Everything ok
      });
    };

    // Click on a status button
    $statusList.click(function (ev) {
      ev.preventDefault(); // Avoid page reload.
      var btnValue = ev.target.dataset.status;
      if (typeof btnValue === 'string' && btnValue.length > 0) {
        submitStatus(btnValue);
      }
    });

    // Click on a type button
    $typeList.click(function (ev) {
      ev.preventDefault(); // Avoid page reload.
      var btnValue = ev.target.dataset.type;
      if (typeof btnValue === 'string' && btnValue.length > 0) {
        submitType(btnValue);
      }
    });
  };

  this.unbind = function () {
    location.off('location_status_changed');
    location.off('location_type_changed');

    $('#tresdb-location-statustype-form-show').off();
    $('#tresdb-location-statustype-form-cancel').off();
    $('#tresdb-location-status-list').off();
    $('#tresdb-location-type-list').off();
  };
};
