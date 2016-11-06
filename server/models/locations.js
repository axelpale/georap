
var clustering = require('../services/clustering');


exports.create = function (db, username, geom, callback) {
  // Create a new location from GeoJSON Point and store it to DB.
  //
  // Parameters:
  //   db
  //     Monk DB instance
  //   username
  //     string, the creator
  //   geom
  //     GeoJSON Point
  //   callback
  //     function (err, newLocation)

  clustering.findLayerForPoint(db, geom, 1, function (err, layer) {
    if (err) {
      return callback(err);
    }

    var coll = db.get('locations');
    var now = new Date();

    var newLoc = {
      name: '',
      geom: geom,
      deleted: false,
      tags: [],
      content: [{
        type: 'created',
        user: username,
        time: now.toISOString(),
        data: {},
      }],
      neighborsAvgDist: 1000,  // dummy value
      layer: layer,
    };

    coll.insert(newLoc, {}, function (err2, result) {
      if (err2) {
        return callback(err2);
      }

      // For result docs, see:
      // http://mongodb.github.io/node-mongodb-native/2.0/
      // api/Collection.html#~insertWriteOpResult
      //
      // But suprise suprice.... Monk has its own undocumented
      // behavior. :(
      // It returns the inserted document with the _id.

      return callback(null, result);
    });
  });

};

exports.count = function (db, callback) {

  var coll = db.get('locations');

  coll.count({ deleted: false }, {}, function (err, number) {
    return callback(err, number);
  });
};
