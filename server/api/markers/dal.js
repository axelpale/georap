var db = require('../../services/db');
var clustering = require('../../services/clustering');

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
