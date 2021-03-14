/* global google */
/* eslint-disable max-statements */
var geostamp = require('geostamp');
var template = require('./template.ejs');
var AdditionMarker = require('../../Map/AdditionMarker');
var ui = require('tresdb-ui');
var mapStateStore = tresdb.stores.mapstate;

// Reuse the map instance after first use to avoid memory leaks.
// Google Maps does not handle garbage collecting well.
var gmap = {
  elem: null,
  map: null,
  marker: null,
  listener: null,
};

var getAllCoords = function (loc) {
  // coordinates in each registered coordinate system.

  // Coordinate systems and their templates
  var systemNames = tresdb.config.coordinateSystems.map(function (sys) {
    return sys[0];
  });

  var allCoords = systemNames.map(function (sysName) {
    var coords = loc.getAltGeom(sysName);

    var tmplParams = {
      lat: coords[1],
      lng: coords[0],
      absLat: Math.abs(coords[1]),
      absLng: Math.abs(coords[0]),
      getLatDir: geostamp.latitudeDirection,
      getLngDir: geostamp.longitudeDirection,
      getD: geostamp.getDecimal,
      getDM: geostamp.getDM,
      getDMS: geostamp.getDMS,
    };

    var systemHtml = tresdb.templates[sysName](tmplParams);

    return {
      name: sysName,
      html: systemHtml,
    };
  });

  return allCoords;
};

module.exports = function (location) {

  // For unbinding to prevent memory leaks.
  var locationListeners = {};

  // Public methods

  this.bind = function ($mount) {

    // Render
    $mount.html(template({
      location: location,
      allCoords: getAllCoords(location),
    }));

    // Preparation for binds

    var $edit = $('#tresdb-location-coords-edit');
    var $container = $('#tresdb-location-coords-container');
    var $progress = $('#tresdb-location-coords-progress');
    var $geostamp = $('#tresdb-location-coords-geostamp');
    var $form = $('#tresdb-location-coords-form');
    var $cancel = $('#tresdb-location-coords-cancel');
    var $error = $('#tresdb-location-coords-error');
    var $lng = $('#tresdb-location-coords-longitude');
    var $lat = $('#tresdb-location-coords-latitude');

    var initMap = function () {
      var $map = $('#tresdb-location-coords-map');

      var mapState = mapStateStore.get();

      var options = {
        zoom: mapState.zoom,
        center: {
          lat: location.getLatitude(),
          lng: location.getLongitude(),
        },
        mapTypeId: mapState.mapTypeId,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true, // scale stick
      };

      if (gmap.map === null && gmap.elem === null) {
        gmap.elem = $map[0];
        gmap.map = new google.maps.Map(gmap.elem, options);
      } else {
        // Already initialised
        $map.replaceWith(gmap.elem);
        gmap.map.setZoom(options.zoom);
        gmap.map.setCenter(options.center);
        gmap.map.setMapTypeId(options.mapTypeId);
      }

      // Reuse the marker class of location creation.
      // Familiar affordance for the user.
      gmap.marker = new AdditionMarker(gmap.map);
      gmap.marker.show();
      gmap.listener = gmap.map.addListener('center_changed', function () {
        var latlng = gmap.map.getCenter();
        $lng.val(latlng.lng());
        $lat.val(latlng.lat());
      });
    };

    var closeMap = function () {
      // Avoid memory leaks.
      gmap.marker.hide();
      gmap.marker = null;
      gmap.listener.remove();
      gmap.listener = null;
    };

    var isFormOpen = function () {
      var isHidden = $container.hasClass('hidden');
      return !isHidden;
    };

    var openForm = function () {
      ui.show($container);
      ui.show($form);
      // Hide all possible error messages
      ui.hide($error);
      // Load map
      initMap();
    };

    var closeForm = function () {
      ui.hide($container);
      // Hide all possible error messages
      ui.hide($error);
      // Destroy map (partially)
      closeMap();
    };

    var prefill = function () {
      var lng = location.getLongitude();
      var lat = location.getLatitude();

      $lng.val(lng);
      $lat.val(lat);
    };

    // Binds

    $edit.click(function (ev) {
      ev.preventDefault();

      if (isFormOpen()) {
        closeForm();
      } else {
        openForm();
        prefill();
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      closeForm();
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $lng.val();
      var latRaw = $lat.val();

      var lng = parseFloat(lngRaw);
      var lat = parseFloat(latRaw);

      // Hide form and show progress bar
      ui.hide($form);
      ui.show($progress);

      location.setGeom(lng, lat, function (err) {
        // Hide progress bar
        ui.hide($progress);

        if (err) {
          ui.show($error);
          return;
        }
        closeForm();
      });
    });

    (function defineMore() {
      var $more = $('#tresdb-location-coords-more');
      var $moreopen = $('#tresdb-location-coords-more-open');
      var $moreclose = $('#tresdb-location-coords-more-close');

      $moreopen.click(function (ev) {
        ev.preventDefault();
        ui.hide($moreopen);
        ui.show($moreclose);
        ui.show($more);
      });

      $moreclose.click(function (ev) {
        ev.preventDefault();
        ui.hide($moreclose);
        ui.show($moreopen);
        ui.hide($more);
      });

    }());

    // Event handling

    var geomChangedHandler = function () {
      // Update coords on geom change.
      // Get coords in each coord system.
      var allCoords = getAllCoords(location);
      // WGS84
      $geostamp.html(allCoords[0].html);
      // Other systems
      var $more = $('#tresdb-location-coords-more');
      var moreHtml = allCoords.reduce(function (acc, c) {
        var content = c.html + ' (' + c.name + ')';
        return acc + '<div><span>' + content + '</span></div>';
      }, '');
      $more.html(moreHtml);
    };

    location.on('location_geom_changed', geomChangedHandler);
    // Register listener.
    // eslint-disable-next-line dot-notation
    locationListeners['location_geom_changed'] = geomChangedHandler;
  };

  this.unbind = function () {
    $('#tresdb-location-coords-edit').off();
    $('#tresdb-location-coords-form').off();
    $('#tresdb-location-coords-cancel').off();
    $('#tresdb-location-coords-more-open').off();

    Object.keys(locationListeners).forEach(function (k) {
      location.off(k, locationListeners[k]);
    });
  };
};
