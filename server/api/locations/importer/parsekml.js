var xmltransform = require('camaro');
var toMarkdown = require('to-markdown');
var striptags = require('striptags');
var _ = require('lodash');


// Collects paths from markdown links [name](path)
var COLLECT_IMAGE_URLS = /(?:!\[)[^\]]*\]\(([^)]+)\)/g;
// Coordinate comparison precision in number of characters
var PREC = 8;

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
  var parts = str.trim().split(/\s*[,;:\s]\s*/);
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
  if (typeof desc !== 'string') {
    return '';
  }
  var spaced = desc.replace('/a><a', '/a>, <a');
  var mark = toMarkdown(spaced.trim());
  return striptags(mark);
};

var findImageUrls = function (markdown) {
  // Find paths from markdown links
  //
  // Return
  //   list of path strings, relative file paths or absolute urls
  //
  // See https://stackoverflow.com/a/432503/638546
  var urls = [];
  var collector = new RegExp(COLLECT_IMAGE_URLS);
  var match = collector.exec(markdown);
  while (match !== null) {
    // match[0] is the entire matched string
    // match[1] is the first captured string
    urls.push(match[1]);
    match = collector.exec(markdown);
  }
  return urls;
};

var stripImageLinks = function (markdown) {
  return markdown.replace(COLLECT_IMAGE_URLS, '');
};


module.exports = function (kmlBuffer, callback) {
  // Find an array of locations from a KML file.
  //
  // Parameters
  //   kmlBuffer
  //     a Buffer
  //   callback
  //     function (err, locations)
  //       err
  //       locations: [{
  //         name
  //         latitude
  //         longitude
  //         entries: [{
  //           markdown
  //           filepath
  //         }]
  //       }]
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
  var combinedLocations = result.rootLocations;
  result.folders.forEach(function (folder) {

    if (folder.locations.length > 0) {
      var first = folder.locations[0];

      first.descriptions = [folder.description];
      first.overlays = folder.overlays;
    }

    combinedLocations = combinedLocations.concat(folder.locations);
  });

  // Format locations: remove empty properties etc
  var finalLocations = combinedLocations.map(function (loc) {

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

    // Combine and filter descriptions
    var finalDescriptions = (function processDescriptions() {
      var combined = [];

      // Combine
      if (loc.hasOwnProperty('descriptions')) {
        combined = loc.descriptions;
      }

      if (loc.hasOwnProperty('description')) {
        combined.push(loc.description);
      }

      // Remove empty descriptions
      var nonempty = combined.filter(function (desc) {
        return desc.length > 0;
      });

      // Convert descriptions to markdown. Remove all remaining HTML.
      var sanitized = nonempty.map(sanitizeDescription);

      // Remove duplicate descriptions
      var unique = _.uniq(sanitized);

      // Remove descriptions that only repeat the location coordinates
      var valuable = unique.filter(function (desc) {
        var a, b, c, d;
        var coord = parseCoordinate(desc);
        if (coord) {
          // Do not care about the lat, lng order
          a = coord[0].toFixed(PREC);
          b = coord[1].toFixed(PREC);
          c = avgLonLat[0].toFixed(PREC);
          d = avgLonLat[1].toFixed(PREC);
          if ((a === c && b === d) || (a === d && b === c)) {
            // Coordinate is just a repetition
            return false;
          }
        }
        return true;
      });

      return valuable;
    }());

    var finalOverlays = (function () {
      if (!loc.hasOwnProperty('overlays')) {
        return [];
      }

      return loc.overlays.map(function (ol) {
        return {
          name: ol.name,
          description: sanitizeDescription(ol.description),
          href: ol.href,
        };
      });
    }());

    // Transform descriptions and overlays to entries
    var finalEntries = (function () {
      var entries = [];

      finalOverlays.forEach(function (ol) {
        entries.push({
          markdown: ol.name + ': ' + ol.description,
          filepath: ol.href,
        });
      });

      finalDescriptions.forEach(function (desc) {
        var imgUrls = findImageUrls(desc);
        var textContent = stripImageLinks(desc);
        var i;

        if (imgUrls.length === 0) {
          // No images, single entry
          entries.push({
            markdown: textContent,
            filepath: null,
          });
        } else {
          // First image with the text.
          entries.push({
            markdown: textContent,
            filepath: imgUrls[0],
          });

          // Next images without description
          for (i = 1; i < imgUrls.length; i += 1) {
            entries.push({
              markdown: '',
              filepath: imgUrls[i],
            });
          }
        }
      });

      return entries;
    }());

    return {
      name: loc.name,
      longitude: avgLonLat[0],
      latitude: avgLonLat[1],
      entries: finalEntries,
    };
  });

  return callback(null, finalLocations);
};
