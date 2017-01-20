/* global google */

var geostamp = require('../lib/geostamp');
var template = require('./coords.ejs');

module.exports = function (location) {


  // Public methods

  this.render = function () {
    return template({
      location: location,
      geostamp: geostamp,
    });
  };

  this.bind = function () {

    // Preparation

    // var $edit = $('#tresdb-location-coords-edit');
    // var $container = $('#tresdb-location-coords-container');
    // var $cancel = $('#tresdb-location-visit-cancel');
    // var $error = $('#tresdb-location-coords-error');
    //
    // var isFormOpen = function () {
    //   var isHidden = $container.hasClass('hidden');
    //   return !isHidden;
    // };

    // var map = null;
    //
    // var openForm = function () {
    //   $container.removeClass('hidden');
    //   // Hide all possible error messages
    //   $error.addClass('hidden');
    //
    //   // Create google maps
    //   var mapEl = $('#tresdb-location-coords-map')[0];
    //   map = new google.maps.Map(mapEl, {
    //     center: {
    //       lat: location.getLatitude(),
    //       lng: location.getLongitude(),
    //     },
    //     zoom: 7,
    //     mapTypeId: 'satellite',
    //   });
    // };
    //
    // var closeForm = function () {
    //   $container.addClass('hidden');
    //   // Hide all possible error messages
    //   $error.addClass('hidden');
    // };
    //
    // // Binds
    //
    // $edit.click(function (ev) {
    //   ev.preventDefault();
    //
    //   if (isFormOpen()) {
    //     closeForm();
    //   } else {
    //     openForm();
    //   }
    // });
    //
    // $cancel.click(function (ev) {
    //   ev.preventDefault();
    //   closeForm();
    // });

  };

  this.unbind = function () {

  };
};
