/* global google */
/* eslint-disable max-statements */
var geostamp = require('geostamp');
var template = require('./template.ejs');
var AdditionMarker = require('../../Map/AdditionMarker');
var ui = require('georap-ui');
var mapStateStore = georap.stores.mapstate;

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
  var systemNames = georap.config.coordinateSystems.map(function (sys) {
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

    var systemHtml = georap.templates[sysName](tmplParams);

    return {
      name: sysName,
      html: systemHtml,
    };
  });

  return allCoords;
};

module.exports = function (location) {

  var $mount = null;
  var children = {};
  var $elems = {};
  // For unbinding to prevent memory leaks.
  var locationListeners = {};

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    // Render
    $mount.html(template({
      location: location,
      allCoords: getAllCoords(location),
      __: georap.i18n.__,
    }));

    // Preparation for binds

    $elems.edit = $mount.find('#location-geom-edit');
    $elems.container = $mount.find('#location-geom-container');
    $elems.progress = $mount.find('#location-geom-progress');
    $elems.geostamp = $mount.find('#location-geom-geostamp');
    $elems.form = $mount.find('#location-geom-form');
    $elems.cancel = $mount.find('#location-geom-cancel');
    $elems.error = $mount.find('#location-geom-error');
    $elems.lng = $mount.find('#location-geom-longitude');
    $elems.lat = $mount.find('#location-geom-latitude');

    var initMap = function () {
      $elems.map = $mount.find('#location-geom-map');

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
        gmap.elem = $elems.map[0];
        gmap.map = new google.maps.Map(gmap.elem, options);
      } else {
        // Already initialised
        $elems.map.replaceWith(gmap.elem);
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
        $elems.lng.val(latlng.lng());
        $elems.lat.val(latlng.lat());
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
      var isHidden = $elems.container.hasClass('hidden');
      return !isHidden;
    };

    var openForm = function () {
      ui.show($elems.container);
      ui.show($elems.form);
      // Hide all possible error messages
      ui.hide($elems.error);
      // Load map
      initMap();
    };

    var closeForm = function () {
      ui.hide($elems.container);
      // Hide all possible error messages
      ui.hide($elems.error);
      // Destroy map (partially)
      closeMap();
    };

    var prefill = function () {
      var lng = location.getLongitude();
      var lat = location.getLatitude();

      $elems.lng.val(lng);
      $elems.lat.val(lat);
    };

    // Binds

    $elems.edit.click(function (ev) {
      ev.preventDefault();

      if (isFormOpen()) {
        closeForm();
      } else {
        openForm();
        prefill();
      }
    });

    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      closeForm();
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $elems.lng.val();
      var latRaw = $elems.lat.val();

      var lng = parseFloat(lngRaw);
      var lat = parseFloat(latRaw);

      // Hide form and show progress bar
      ui.hide($elems.form);
      ui.show($elems.progress);

      location.setGeom(lng, lat, function (err) {
        // Hide progress bar
        ui.hide($elems.progress);

        if (err) {
          ui.show($elems.error);
          return;
        }
        closeForm();
      });
    });

    (function defineMore() {
      $elems.more = $mount.find('#location-geom-more');
      $elems.moreopen = $mount.find('#location-geom-more-open');
      $elems.moreclose = $mount.find('#location-geom-more-close');

      $elems.moreopen.click(function (ev) {
        ev.preventDefault();
        ui.hide($elems.moreopen);
        ui.show($elems.moreclose);
        ui.show($elems.more);
      });

      $elems.moreclose.click(function (ev) {
        ev.preventDefault();
        ui.hide($elems.moreclose);
        ui.show($elems.moreopen);
        ui.hide($elems.more);
      });

    }());

    // Event handling

    var geomChangedHandler = function () {
      // Update coords on geom change.
      // Get coords in each coord system.
      var allCoords = getAllCoords(location);
      // WGS84
      $elems.geostamp.html(allCoords[0].html);
      // Other systems
      var moreHtml = allCoords.reduce(function (acc, c) {
        var content = c.html + ' (' + c.name + ')';
        return acc + '<div><span>' + content + '</span></div>';
      }, '');
      $elems.more.html(moreHtml);
    };

    location.on('location_geom_changed', geomChangedHandler);
    // Register listener.
    // eslint-disable-next-line dot-notation
    locationListeners['location_geom_changed'] = geomChangedHandler;
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      Object.keys(locationListeners).forEach(function (k) {
        location.off(k, locationListeners[k]);
      });
      $mount = null;
    }
  };
};
