var normalizeDescriptions = require('./normalizeDescriptions');
var combineCoordinates = require('./combineCoordinates');
var normalizeOverlays = require('./normalizeOverlays');
var normalizeName = require('./normalizeName');
var makeEntries = require('./makeEntries');
var TEMPLATE = require('./template');
var camaro = require('camaro');

// Interface

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

  camaro.transform(kmlBuffer, TEMPLATE).then(function (result) {
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
    var formattedLocations = combinedLocations.map(function (loc) {
      // Replace empty names with something.
      loc.name = normalizeName(loc);
      // Combine coordinates from Point, LineString, and Polygon.
      var avgLonLat = combineCoordinates(loc);
      // Combine and filter descriptions and overlays
      var finalDescriptions = normalizeDescriptions(loc, avgLonLat);
      var finalOverlays = normalizeOverlays(loc);
      // Transform descriptions and overlays to entries
      var finalEntries = makeEntries(finalOverlays, finalDescriptions);
      // A temporary format for locations to import.
      return {
        name: loc.name,
        longitude: avgLonLat[0],
        latitude: avgLonLat[1],
        entries: finalEntries,
      };
    });

    // Filter out locations with no valid coordinates:
    var validatedLocations = formattedLocations.filter(function (loc) {
      if (typeof loc.name === 'string') {
        if (typeof loc.longitude === 'number' && !isNaN(loc.longitude)) {
          if (typeof loc.latitude === 'number' && !isNaN(loc.latitude)) {
            return true;
          }
        }
      }
      return false;
    });

    return callback(null, validatedLocations);
  }).catch(function (err) {
    return callback(err);
  });
};
