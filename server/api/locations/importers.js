/* eslint-disable max-statements */
var sax = require('sax');

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
  // -

  var strict = true;
  var parser = sax.parser(strict);

  // Finished locations are collected here. They have structure:
  // - String name
  // - Float latitude
  // - Float longitude
  // - Array descriptions
  // - Array overlays
  var finalLocations = [];
  // Descriptions and GroundOverlays are collected here.
  // At Folder close, they are attached to the first location,
  // and then the locations considered as finished and pushed
  // into 'locations'.
  // An item object in 'folders' has following structure:
  // - descriptions: array
  // - groudOverlays: array
  // - locations: array
  // Var 'folders' is used as a stack because folder hierarchy
  //   folders[0] to access top item
  //   folders.shift() to remove top item
  //   folders.unshift(item) to add top item
  // We init folders with a root-folder. We need to extract this to
  // finalLocations at end.
  var folders = [{
    descriptions: [],
    groundOverlays: [],
    locations: [],
  }];
  // Currently processed location is built here.
  // After location is successfully built, it is added to locations array
  // and loc is set back to null.
  var loc = null;

  var onFolderOpen = function () {
    folders.unshift({
      descriptions: [],
      groundOverlays: [],
      locations: [],
    });
  };
  var onFolderClose = function () {
    var st;
    var folder = folders.shift();  // remove and process the folder

    // Move collected descriptions and groundOverlays into the first location
    // before combining folder's accumulated locations into final loc set.
    if (folder.locations.length > 0) {
      st = folder.locations[0];
      st.descriptions = st.descriptions.concat(folder.descriptions);
      st.groundOverlays = st.groundOverlays.concat(folder.groundOverlays);

      finalLocations = finalLocations.concat(folder.locations);
    } else if (folder.descriptions.length > 0) {
      console.log('Descriptions discarded');
    } else if (folder.groundOverlays.length > 0) {
      console.log('GroundOverlays discarded');
    }

  };
  var onFolderDescriptionClose = function (desc) {
    folders[0].descriptions.push(desc);
  };

  var onPlacemarkOpen = function () {
    loc = {
      descriptions: [],
      groundOverlays: [],
    };
  };
  var onPlacemarkClose = function () {
    if (loc.hasOwnProperty('name') &&
        loc.hasOwnProperty('longitude') &&
        loc.hasOwnProperty('latitude')) {
      folders[0].locations.push(loc);
    } else {
      console.log('Placemark discarded');
    }
    loc = null;
  };
  var onPlacemarkNameClose = function (name) {
    loc.name = name;
  };
  var onPlacemarkDescriptionClose = function (desc) {
    loc.descriptions.push(desc);
  };
  var onPlacemarkPointCoordinatesClose = function (coords) {
    var parts;

    if (typeof coords === 'string') {
      parts = coords.split(',');

      if (parts.length >= 2) {
        loc.longitude = parts[0];
        loc.latitude = parts[1];
        return;  // success
      }
    }

    // else
    throw new Error('invalid coordinates');
  };

  var onEnd = function () {
    onFolderClose();  // process root-folder
    return callback(null, finalLocations);
  };


  (function defineParsing() {
    var text = null;  // combine text and cdata nodes here
    //var folderTag = false;
    var placemarkTag = false;
    //var placemarkNameTag = false;
    //var placemarkDescriptionTag = false;
    var placemarkPointTag = false;
    //var placemarkPointCoordinatesTag = false;

    parser.onerror = function (err) {
      console.log('ERROR', err);
    };
    parser.ontext = function (t) {
      if (text) {
        text += t;
      } else {
        text = t;
      }
    };
    parser.oncdata = function (a) {
      console.log('oncdata:', a);
      if (text) {
        text += a;
      } else {
        text = a;
      }
    };
    parser.onopentag = function (node) {
      // opened a tag.  node has "name" and "attributes"
      console.log('opentag:', node);
      var tag = node.name;

      if (tag === 'Folder') {
        //folderTag = true;
        onFolderOpen();
        return;
      }

      if (tag === 'Placemark') {
        placemarkTag = true;
        onPlacemarkOpen();
        return;
      }

      if (placemarkTag) {
        if (tag === 'name') {
          //placemarkNameTag = true;
          text = null;
          return;
        }

        if (tag === 'description') {
          //placemarkDescriptionTag = true;
          text = null;
          return;
        }

        if (tag === 'Point') {
          placemarkPointTag = true;
          return;
        }

        if (placemarkPointTag && tag === 'coordinates') {
          //placemarkPointCoordinatesTag = true;
          text = null;
          return;
        }
      }

      if (!placemarkTag && tag === 'description') {
        // folderDescriptionTag = true;
        text = null;
        return;
      }
    };
    parser.onclosetag = function (tag) {
      console.log('closetag:', tag);

      if (tag === 'Folder') {
        //folderTag = false;
        onFolderClose();
        return;
      }

      if (tag === 'Placemark') {
        placemarkTag = false;
        onPlacemarkClose();
        return;
      }

      if (placemarkTag) {
        if (tag === 'name') {
          //placemarkNameTag = false;
          onPlacemarkNameClose(text);
          return;
        }

        if (tag === 'description') {
          //placemarkDescriptionTag = false;
          onPlacemarkDescriptionClose(text);
          return;
        }

        if (tag === 'Point') {
          placemarkPointTag = false;
          return;
        }

        if (placemarkPointTag && tag === 'coordinates') {
          //placemarkPointCoordinatesTag = false;
          onPlacemarkPointCoordinatesClose(text);
          return;
        }
      }

      if (!placemarkTag && tag === 'description') {
        onFolderDescriptionClose(text);
        return;
      }
    };
    // parser.onattribute = function (attr) {
    //   // an attribute.  attr has "name" and "value"
    //   console.log('attr:', attr);
    // };
    parser.onend = function () {
      // parser stream is done, and ready to have more stuff written to it.
      // console.log('end');
      onEnd();
    };

    parser.write(buffer).close();
  }());

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
