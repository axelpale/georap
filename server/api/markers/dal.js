var db = require('../../services/db');

exports.getAll = function (callback) {
  // Get all non-deleted markers.
  //
  // Parameters:
  //   callback
  //     function (err, docs)

  var coll = db.get().collection('locations');

  // Exclude deleted
  var q = { deleted: false };

  coll.find(q).toArray(callback);
};

exports.getFiltered = function (params, callback) {
  // Parameters:
  //   params
  //     username:
  //       string
  //     visited
  //       string, possibilities: 'off', 'you', 'notyou', 'nobody'
  //     tags
  //       array, tags to allow. Include locations with any of these tags.
  //     text
  //       search term, use '' to disable.
  //   callback
  //     function (err, docs)

  var coll = db.get().collection('locations');
  var q = {};
  var opts = {
    limit: 100,
    skip: 0,
  };

  if (params.text.length > 0) {
    // q.name = {
    //   $regex: new RegExp('.*' + params.text + '.*', 'i'),
    // };
    q.$text = {
      $search: params.text,
      // See https://docs.mongodb.com/manual/reference
      //     /text-search-languages/#text-search-languages
      // for available languages.
      // Setting the language hid some results. For example 'town' with
      // the language 'fi' did not match 'irbene ghost town';
      //$language: 'fi',
    };
  }

  // Exclude deleted
  q.deleted = false;

  // Sort by score. Same options need to appear in projection.
  // See https://docs.mongodb.com/manual/reference/operator/
  //     projection/meta/#proj._S_meta
  var sortOpts = {
    score: { $meta: 'textScore' },
  };

  coll.find(q, sortOpts, opts).sort(sortOpts).toArray(callback);
};

exports.getWithin = function (params, callback) {
  // Find undeleted markers (=raw locations) near a point and on and above
  // a certain level.
  //
  // Parameters:
  //   params
  //     lat
  //       latitude
  //     lng
  //       longitude
  //     radius
  //       integer, meters
  //     layer
  //       integer. Include only locations with smaller or equal layer number.
  //     query
  //       a limiting query
  //   callback
  //     function (err, markers)
  //

  var center = [params.lng, params.lat];
  var radius = params.radius;
  var query = params.query;

  // Layer number less than equal: only the "higher" markers are included.
  query.layer = { $lte: params.layer };
  query.deleted = false;

  // See docs:
  // https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/
  var pipeline = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: center,
        },
        // If near is specified in GeoJSON, maxDistance takes meters.
        // If near is specified in legacy coordinates, it takes radians.
        // We use GeoJSON so meters it is.
        maxDistance: radius,
        // Limit number of results. The query and maxDistance limit already
        // very much but ensure the limit with this.
        limit: 1000,
        query: query,
        distanceField: 'dist',
        spherical: true,
      },
    },
    // Return only what is needed for displaying markers.
    {
      $project: {
        name: true,
        geom: true,
        tags: true,
        layer: true,
      },
    },
  ];

  var opts = {
    cursor: {},
  };

  db.collection('locations')
    .aggregate(pipeline, opts)
    .toArray(callback);
};
