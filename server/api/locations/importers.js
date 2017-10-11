/* eslint-disable max-statements,max-lines */

var xmltransform = require('camaro');


exports.readKML = function (buffer, callback) {
  // Find an array of locations from a KML file.
  //
  // Parameters
  //   buffer
  //     a Buffer that represents KML file
  //   callback
  //     function (err, locations)
  //
  // Rules
  // - descriptions and GroundOverlays in a Folder are attached under
  //   the location created for the first Placemark within
  //   the Folder.
  //
  var placemarkTemplate = {
    name: 'name',
    description: 'description',
    coordinates: 'Point/coordinates',
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

  var template = {
    rootLocations: ['//Document/Placemark', placemarkTemplate],
    folders: ['//Folder', {
      description: 'description',
      locations: ['./Placemark', placemarkTemplate],
      overlays: ['./GroundOverlay', overlayTemplate],
    }],
  };

  var result = xmltransform(buffer.toString('utf8'), template);

  // Combine locations
  var finalLocations = result.rootLocations;
  result.folders.forEach(function (folder) {

    if (folder.locations.length > 0) {
      var first = folder.locations[0];

      first.descriptions = [folder.description];
      first.overlays = folder.overlays;
    }

    finalLocations = finalLocations.concat(folder.locations);
  });

  // Format locations: remove empty properties
  finalLocations.forEach(function (loc) {

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

    // Split coordinates
    var lonLat = loc.coordinates.split(',');
    loc.longitude = parseFloat(lonLat[0]);
    loc.latitude = parseFloat(lonLat[1]);
    delete loc.coordinates;

    // Always have overlays even when empty
    if (!loc.hasOwnProperty('overlays')) {
      loc.overlays = [];
    }
  });

  return callback(null, finalLocations);
};


exports.readKMZ = function (buffer, callback) {
  // KMZ is a zipped collection of resources and KML files.

  // dummy
  return exports.readKMZ(buffer, callback);
};


exports.readGPX = function (buffer, callback) {
  // Find an array of locations from a GPX file.
  //
  // Parameters
  //   buffer
  //     a Buffer that represents GPX file
  //   callback
  //     function (err, locations)

  // dummy
  return callback(null, [
    {
      name: 'Fooloc',
      lat: 62.0,
      lng: 23.0,
      description: 'This is a location from GPX',
    },
  ]);
};
