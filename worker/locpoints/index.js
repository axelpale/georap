// Refresh points for each location.

var markersDal = require('../../server/api/markers/dal');
var dal = require('./dal');
var async = require('async');

exports.run = function (callback) {

  markersDal.getAll(function (err, markers) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(markers, function iteratee(m, cb) {
      dal.computePointsAndStore(m._id, cb);
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      var msg = 'locpoints: Points of locations (' + markers.length + ') ' +
                'computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
