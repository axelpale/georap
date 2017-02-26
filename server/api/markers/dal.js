var db = require('../../services/db');
var clustering = require('../../services/clustering');

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

  coll.find(q, opts).toArray(callback);
};

exports.getWithin = function (params, callback) {

  clustering.findWithin({
    db: db.get(),
    center: [params.lng, params.lat],
    radius: params.radius,
    // Only locations on the layer or higher (smaller layer number).
    query: {
      layer: { $lte: params.layer },
      deleted: false,
    },
    callback: callback,
  });
};
