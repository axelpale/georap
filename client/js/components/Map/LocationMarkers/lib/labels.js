
var TYPE_TO_COLOR = {
  'terrain': 'black',
  'roadmap': 'black',
  'hybrid': 'white',
  'satellite': 'white',
};

exports.mapTypeIdToLabelColor = function (typeid) {
  return TYPE_TO_COLOR[typeid];
};

exports.ensureLabel = function (marker, typeid, forceUpdate) {
  // Ensure that label is visible.
  //
  // Parameters:
  //   marker
  //     A marker with marker.get('location') set.
  //   typeid
  //     google maps map type id. Dark type asks white labels and vice versa.
  //   forceUpdate
  //     bool. Optional, default false.
  //     If true, update the label even when label is already visible.

  var loc = marker.get('location');

  // Note: getLabel can return undefined or null, regarding
  // whether setLabel(null) is called or not.
  if (forceUpdate || !marker.getLabel()) {
    marker.setLabel({
      color: exports.mapTypeIdToLabelColor(typeid),
      text: (loc.name === '' ? 'Untitled' : loc.name),
    });
  }
};

exports.hasLabel = function (marker) {
  // Return true if marker has label visible.
  return Boolean(marker.getLabel());
};

exports.hideLabel = function (marker) {
  marker.setLabel(null);
};

exports.updateMarkerLabels = function (markers, typeid) {
  // Parameters:
  //   markers
  //     an object collection of google.maps.Marker instances
  //   typeid
  //     google maps map type id. Dark type asks white labels and vice versa.
  var color, k, label;

  color = exports.mapTypeIdToLabelColor(typeid);

  for (k in markers) {
    if (markers.hasOwnProperty(k)) {
      label = markers[k].getLabel();
      if (label) {
        label.color = color;
        markers[k].setLabel(label);
      }
    }
  }
};
