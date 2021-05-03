// Refresh points for each location.

const markersDal = require('../../server/api/markers/dal');
const dal = require('./dal');
const asyn = require('async');

exports.run = function (callback) {

  markersDal.getAll((err, markers) => {
    if (err) {
      return callback(err);
    }

    asyn.eachSeries(markers, (m, cb) => {
      dal.computePointsAndStore(m._id, cb);
    }, (err2) => {
      if (err2) {
        return callback(err2);
      }

      const msg = 'locpoints: Points of locations (' + markers.length + ') ' +
                'computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
