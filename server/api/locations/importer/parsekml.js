var xmltransform = require('camaro');
var toMarkdown = require('to-markdown');
var striptags = require('striptags');
var _ = require('lodash');

var placemarkTemplate = {
  name: 'name',
  description: 'description',
  coordinates: 'Point/coordinates',
  line: 'LineString/coordinates',
  polygon: 'Polygon//coordinates',
};

var overlayTemplate = {
  name: 'name',
  description: 'description',
  href: './Icon/href',
  viewBoundScale: 'number(./Icon/viewBoundScale)',
  latLonBox: {
    north: 'number(./LatLonBox/north)',
    south: 'number(./LatLonBox/south)',
    east: 'number(./LatLonBox/east)',
    west: 'number(./LatLonBox/west)',
    rotation: 'number(./LatLonBox/rotation)',
  },
};

var TEMPLATE = {
  rootLocations: ['//Document/Placemark', placemarkTemplate],
  folders: ['//Folder', {
    description: 'description',
    locations: ['./Placemark', placemarkTemplate],
    overlays: ['./GroundOverlay', overlayTemplate],
  }],
};

var parseCoordinate = function (str) {
  // Return
  //   null if not valid
  //   [lat, lng] otherwise
  var lat, lng;
  var parts = str.split(/\s*[,;:\s]\s*/);
  if (parts.length === 2) {
    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return [lat, lng];
  }
  return null;
};

var sanitizeDescription = function (desc) {
  // Convert to markdown. Remove all remaining html tags.
  // Sometimes descriptions include only adjacent anchor tags.
  // We like to add a space between them for clarity.
  var spaced = desc.replace('/a><a', '/a> <a');
  var mark = toMarkdown(spaced.trim());
  return striptags(mark);
};


module.exports = function (kmlBuffer, callback) {
  // Find an array of locations from a KML file.
  //
  // Parameters
  //   kmlBuffer
  //     a Buffer
  //   callback
  //     function (err, locations)
  //
  // Rules
  // - descriptions and GroundOverlays in a Folder are attached under
  //   the location created for the first Placemark within
  //   the Folder.
  //

  if (Buffer.isBuffer(kmlBuffer)) {
    kmlBuffer = kmlBuffer.toString('utf8');
  }

  if (typeof kmlBuffer !== 'string') {
    throw new Error('parsekml requires a Buffer or string');
  }

  var result = xmltransform(kmlBuffer, TEMPLATE);

  // Combine locations from each folder
  var finalLocations = result.rootLocations;
  result.folders.forEach(function (folder) {

    if (folder.locations.length > 0) {
      var first = folder.locations[0];

      first.descriptions = [folder.description];
      first.overlays = folder.overlays;
    }

    finalLocations = finalLocations.concat(folder.locations);
  });

  // Format locations: remove empty properties etc
  finalLocations.forEach(function (loc) {

    // Combine coordinates from Point, LineString, and Polygon.
    // Parse and compute naive average.
    var avgLonLat = (function () {

      var combined = loc.coordinates;  // empty string if do coords
      if (loc.line.length > 0) {
        combined = combined + ' ' + loc.line;
      }
      if (loc.polygon.length > 0) {
        combined = combined + ' ' + loc.polygon;
      }

      var points = combined.trim().split(' ');
      var numPoints = points.length;

      var sum = points.reduce(function (acc, p) {
        var lonLat = p.split(',');
        acc[0] += parseFloat(lonLat[0]);
        acc[1] += parseFloat(lonLat[1]);
        return acc;
      }, [0, 0]);

      return [
        sum[0] / numPoints,
        sum[1] / numPoints,
      ];

    }());

    // Remove now unnecessary coordinates;
    loc.longitude = avgLonLat[0];
    loc.latitude = avgLonLat[1];
    delete loc.coordinates;
    delete loc.line;
    delete loc.polygon;

    // Combine descriptions
    if (loc.hasOwnProperty('descriptions')) {
      loc.descriptions.push(loc.description);
    } else {
      loc.descriptions = [loc.description];
    }
    delete loc.description;

    // Remove empty descriptions
    loc.descriptions = loc.descriptions.filter(function (desc) {
      return desc.length > 0;
    });

    // Always have overlays even when empty
    if (!loc.hasOwnProperty('overlays')) {
      loc.overlays = [];
    }

    // Convert descriptions to markdown. Remove all remaining HTML.
    loc.descriptions = loc.descriptions.map(sanitizeDescription);
    loc.overlays.forEach(function (ol) {
      if (ol.hasOwnProperty('description')) {
        ol.description = sanitizeDescription(ol.description);
      }
    });

    // Remove duplicate descriptions
    loc.descriptions = _.uniq(loc.descriptions);

    // Remove descriptions that only repeat the location coordinates
    var PREC = 8;
    loc.descriptions = loc.descriptions.filter(function (desc) {
      var a, b, c, d;
      var coord = parseCoordinate(desc);
      if (coord) {
        // Do not care about the lat, lng order
        a = coord[0].toFixed(PREC);
        b = coord[1].toFixed(PREC);
        c = loc.latitude.toFixed(PREC);
        d = loc.longitude.toFixed(PREC);
        if ((a === c && b === d) || (a === d && b === c)) {
          // Coordinate is just a repetition
          return false;
        }
      }
      return true;
    });

  });

  return callback(null, finalLocations);
};
