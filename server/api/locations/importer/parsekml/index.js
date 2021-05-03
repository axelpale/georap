const normalizeDescriptions = require('./normalizeDescriptions');
const combineCoordinates = require('./combineCoordinates');
const normalizeOverlays = require('./normalizeOverlays');
const normalizeName = require('./normalizeName');
const makeEntries = require('./makeEntries');
const TEMPLATE = require('./template');
const camaro = require('camaro');

// Interface

module.exports = (kmlBuffer, callback) => {
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

  camaro.transform(kmlBuffer, TEMPLATE).then((result) => {
    // Combine locations from each folder
    let combinedLocations = result.rootLocations;
    result.folders.forEach((folder) => {

      if (folder.locations.length > 0) {
        const first = folder.locations[0];

        first.descriptions = [folder.description];
        first.overlays = folder.overlays;
      }

      combinedLocations = combinedLocations.concat(folder.locations);
    });

    // Format locations: remove empty properties etc
    const formattedLocations = combinedLocations.map((loc) => {
      // Replace empty names with something.
      loc.name = normalizeName(loc);
      // Combine coordinates from Point, LineString, and Polygon.
      const avgLonLat = combineCoordinates(loc);
      // Combine and filter descriptions and overlays
      const finalDescriptions = normalizeDescriptions(loc, avgLonLat);
      const finalOverlays = normalizeOverlays(loc);
      // Transform descriptions and overlays to entries
      const finalEntries = makeEntries(finalOverlays, finalDescriptions);
      // A temporary format for locations to import.
      return {
        name: loc.name,
        longitude: avgLonLat[0],
        latitude: avgLonLat[1],
        entries: finalEntries,
      };
    });

    // Filter out locations with no valid coordinates:
    const validatedLocations = formattedLocations.filter((loc) => {
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
  }).catch((err) => {
    return callback(err);
  });
};
