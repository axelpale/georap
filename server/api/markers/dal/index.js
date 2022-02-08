const db = require('georap-db');


exports.getAll = function (callback) {
  // Get all non-deleted markers.
  //
  // Parameters:
  //   callback
  //     function (err, docs)

  const coll = db.get().collection('locations');

  // Exclude deleted
  const q = { deleted: false };

  coll.find(q).toArray(callback);
};


// eslint-disable-next-line max-statements
exports.getFiltered = function (params, callback) {
  // Search for locations.
  //
  // Parameters:
  //   params
  //     creator
  //       optional string. Default is 'anyone'.
  //       Include only locations created by this user.
  //       Possible values are:
  //         'anyone'
  //         <username>
  //     deleted
  //       optional boolean. Include only deleted. Default is false.
  //     limit
  //       optional integer. Default is 50.
  //       Number of locations to include.
  //     order
  //       optional string, following values are possible:
  //         'rel', relevance, default if text is used
  //         'az', alphabetical, default if text is not used
  //         'za', alphabetical
  //         'newest', newest first
  //         'oldest', oldest first
  //     skip
  //       optional integer. Default is 0.
  //       Number of locations to skip before first.
  //     text
  //       optional string. A free-form search term.
  //   callback
  //     function (err, docs)
  //
  // Where docs has structure similar to:
  //   [
  //     {
  //       _id: <ObjectId>
  //       user: <string>
  //       geom: <GeoJSON Point>
  //       deleted: <bool>
  //       status: <string>
  //       type: <string>
  //       text1: <string>
  //       text2: <string>
  //       places: <array of strings>
  //       layer: <int>
  //       points: <int>
  //       isLayered: <bool>
  //       childLayer: <int>
  //       score: <float>
  //     },
  //     ...
  //   ]
  //

  // Build query piece by piece.
  const q = {};
  const projOpts = {};
  const sortOpts = {};
  let skipValue = 0;  // default
  let limitValue = 100;  // default

  if (typeof params.text === 'string' && params.text.length > 0) {
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

  if (typeof params.creator === 'string' &&
      params.creator.trim() !== '' &&
      params.creator !== 'anyone') {
    q.creator = params.creator;
  }

  // Include only deleted or exclude deleted.
  if (params.deleted === true) {
    q.deleted = true;
  } else {
    // Exclude deleted by default.
    q.deleted = false;
  }

  if (typeof params.skip === 'number') {
    skipValue = params.skip;
  }
  if (typeof params.limit === 'number') {
    limitValue = params.limit;
  }

  // Sorting
  if (typeof params.order === 'string') {
    if (['rel', 'az', 'za', 'newest', 'oldest'].indexOf(params.order) === -1) {
      throw new Error('Invalid order argument');
    }

    if (params.order === 'rel') {
      // We cannot order by relevance score if text search is not used.
      // We assume the most recent to be the most relevant.
      if ('$text' in q) {
        // Sort by score. Same options need to appear in projection.
        // See https://docs.mongodb.com/manual/reference/operator/
        //     projection/meta/#proj._S_meta
        projOpts.score = { $meta: 'textScore' };
        sortOpts.score = { $meta: 'textScore' };
      } else {
        sortOpts._id = -1;
      }
    } else if (params.order === 'az') {
      sortOpts.name = 1;
    } else if (params.order === 'za') {
      sortOpts.name = -1;
    } else if (params.order === 'newest') {
      sortOpts._id = -1;
    } else if (params.order === 'oldest') {
      sortOpts._id = 1;
    }
  } else if ('$text' in q) {
    // Sort by score. Same options need to appear in projection.
    // See https://docs.mongodb.com/manual/reference/operator/
    //     projection/meta/#proj._S_meta
    projOpts.score = { $meta: 'textScore' };
    sortOpts.score = { $meta: 'textScore' };
  } else {
    // Default order for non-text search
    sortOpts.name = 1;
  }

  db.collection('locations')
    .find(q)
    .project(projOpts)
    .sort(sortOpts)
    .skip(skipValue)
    .limit(limitValue)
    .toArray(callback);
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

  const center = [params.lng, params.lat];
  const radius = params.radius;
  const query = params.query;

  // Layer number less than equal: only the "higher" markers are included.
  query.layer = { $lte: params.layer };
  query.deleted = false;

  // See docs:
  // https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/
  const pipeline = [
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
        status: true,
        type: true,
        layer: true,
        childLayer: true,
      },
    },
  ];

  const opts = {
    cursor: {},
  };

  db.collection('locations')
    .aggregate(pipeline, opts)
    .toArray(callback);
};

exports.getFilteredWithin = require('./getFilteredWithin');
