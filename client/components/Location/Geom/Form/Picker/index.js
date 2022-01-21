/* global google */
var AdditionMarker = require('../../../../Map/AdditionMarker');
var emitter = require('component-emitter');
var mapStateStore = georap.stores.mapstate;

// Reuse the map instance after first use to avoid memory leaks.
// Google Maps does not handle garbage collecting well.
var gmap = {
  elem: null,
  map: null,
  marker: null,
  listener: null,
};

module.exports = function (lng, lat) {
  var self = this;
  emitter(self);

  self.bind = function ($mount) {
    var mapState = mapStateStore.get();

    var options = {
      zoom: mapState.zoom,
      center: {
        lng: lng,
        lat: lat,
      },
      mapTypeId: mapState.mapTypeId,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true, // scale stick
    };

    if (gmap.map === null && gmap.elem === null) {
      gmap.elem = $mount[0]; // to HtmlElement
      gmap.map = new google.maps.Map(gmap.elem, options);
    } else {
      // Already initialised
      $mount.replaceWith(gmap.elem);
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

      self.emit('center_changed', {
        lat: latlng.lat(),
        lng: latlng.lng(),
      });
    });
  };

  self.unbind = function () {
    // Try to avoid memory leaks.
    gmap.marker.hide();
    gmap.marker = null;
    gmap.listener.remove();
    gmap.listener = null;
    self.off();
  };
};
