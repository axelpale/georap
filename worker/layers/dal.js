const db = require('georap-db');

const TOP_LAYER = 1;
const BOTTOM_LAYER = 15;

const EARTH_CIRCUMFERENCE = 40000000;  // metres

exports.getClusterRadius = function (layer) {
  // This function defines the neighborhood size as a function of zoom level.
  // Here layer === zoom level.
  //
  // Return meters.

  // Earth radius in meters.
  const R = 6371000;

  // Desired distance between markers in pixels, somewhat.
  const D = 100;

  // Assumed width of average view of the user in pixels.
  const W = 1000;

  // Ratio between levels
  const r = 0.5;

  // A method to obtain reasonable neighborhood:
  // On level 0, the width of the map is the length of the equator.
  // Thus, upper limit for maxDistance is 2*PI*R / 2, where R is the
  // radius of the earth, 6 371 000 m.
  //     Let's assume user's view is 1000 px wide and a marker is 25 px wide.
  // Also, assume the radius of 50 px to provide loose enough marker
  // arrangement. Now, if 1000 px ~ 2*PI*R, then 50 px ~ 50 * 2*PI*R / 1000.
  // The maxDistance in meters on level 0 is therefore PI * R / 10.
  //     For each lower abstraction level, i.e. higher level number, the
  // width of the view in meters is halved. For level 1, 1000 px ~ PI*R, for
  // level 2, 1000 px ~ PI*R/2, and so on. Thus, for level n, 1000 px ~
  // 2*PI*R * (1/2)^n, and the radius around the marker i.e. maxDistance
  // (50 * 2*PI*R / 1000) * (1/2)^n.
  //     To translate this on JS, let us start with the form:
  // maxDistance = ((D / 2) * 2*PI*R / W) * Math.pow(0.5, level), where D is
  // the desired distance between markers and W is the average width of
  // the view. We simplify the expression:

  return (D * Math.PI * R * Math.pow(r, layer)) / W;
};

exports.findLayerWithClusterRadiusSmallerThan = function (distance) {
  // Find highest such layer that cluster radius
  // (cluster radius = minimum distance between markers)
  // is smaller than the given distance.
  //
  // Begin from the highest layer. For each layer, compute the required
  // cluster radius. Stop when the radius is decreased below the distance
  // to the nearest.
  let layer, r;

  for (layer = TOP_LAYER; layer < BOTTOM_LAYER; layer += 1) {
    r = exports.getClusterRadius(layer);
    if (r < distance) {
      return layer;
    }
  }

  return layer;
};

exports.markAllAsUnlayered = function (callback) {
  // Mark each location with isLayered=false and childLayer=0.
  // This is usually necessary when starting to refresh the layer numbers.
  // TODO what about deleted locations?

  const coll = db.collection('locations');
  const u = {
    $set: {
      isLayered: false,
      childLayer: 0,
    },
  };

  coll.updateMany({}, u, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};

exports.markOneAsUnlayered = function (locationId, callback) {
  // Mark one location with isLayered=false. This is necessary
  // when moving single location and then finding its layer.
  //
  // Parameters:
  //   locationId
  //   callback
  //     function (err)

  const coll = db.collection('locations');
  const q = { _id: locationId };

  coll.updateOne(q, { $set: { isLayered: false } }, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};

exports.findDistToNearestLayered = function (geom, callback) {
  // Find distance in meters to nearest neighbor with isLayered=true.
  // If none found the distance is null.
  //
  // Parameters:
  //   geom
  //     GeoJSON point
  //   callback
  //     function (err, distance, nearest)
  //       err
  //       distance
  //         meters. Null if no loc found.
  //       nearest
  //         nearest location. Null if nearest does not exist.
  //
  const coll = db.collection('locations');

  coll.aggregate([
    {
      $geoNear: {
        near: geom,
        distanceField: 'dist',
        spherical: true,
        limit: 1,  // Retrieve only the closest
        query: {
          isLayered: true,
          deleted: false,
        },
      },
    },
  ]).toArray((err, result) => {

    if (err) {
      return callback(err);
    }

    if (result.length === 0) {
      return callback(null, null, null);
    }

    return callback(null, result[0].dist, result[0]);
  });
};

exports.findLayerForPoint = function (geom, callback) {
  // Find highest layer for a point. Do this by starting on the topmost layer
  // and then lowering the layer until the point is within the radius of
  // the nearest neighbor.
  //
  // Parameters:
  //   geom
  //     GeoJSON Point
  //   callback
  //     function (err, layer, distance, nearest)
  //       Parameters:
  //         err
  //           null if no error
  //         layer
  //           integer
  //         distance
  //           in meters, earth circumference if no nearest one exist
  //         nearest
  //           nearest location, null if nearest does not exist
  //
  exports.findDistToNearestLayered(geom, (err, dist, nearest) => {
    if (err) {
      return callback(err);
    }

    if (dist === null) {
      // There is no nearest one.
      return callback(null, TOP_LAYER, EARTH_CIRCUMFERENCE, null);
    }

    const layer = exports.findLayerWithClusterRadiusSmallerThan(dist);

    return callback(null, layer, dist, nearest);
  });
};

exports.findLayerAndStore = function (loc, callback) {
  //
  // Parameters:
  //   loc
  //     raw location obj that is not yet layered.
  //   callback
  //     function (err)

  const coll = db.collection('locations');

  exports.findLayerForPoint(loc.geom, (err, layer, dist, nearest) => {
    if (err) {
      return callback(err);
    }

    // Update layer of the location.

    const q = { _id: loc._id };
    const u = {
      $set: {
        layer: layer,
        isLayered: true,
      },
    };

    coll.updateOne(q, u, (err2) => {
      if (err2) {
        return callback(err2);
      }

      // The nearest location prevented this location being viewed on
      // an upper layer. Mark the nearest location as parent.

      if (nearest) {
        if (layer > nearest.childLayer) {
          const qNeighbor = { _id: nearest._id };
          const uNeighbor = {
            $set: {
              childLayer: layer,
            },
          };

          coll.updateOne(qNeighbor, uNeighbor, callback);
          return;
        }
      }

      return callback();
    });
  });
};

exports.findAll = function (callback) {
  // Find all undeleted locations, ordered by their points, highest first.
  //
  // Parameters:
  //   callback
  //     function (err, locs)

  const coll = db.collection('locations');

  coll.find({ deleted: false }).sort({ points: -1 }).toArray(callback);
};
