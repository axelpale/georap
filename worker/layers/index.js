// Compute visibility layer for each location.
//
// The algorithm works like this:
// - mark each location as unlayered
// - order locations by points, locs with highest points first
// - starting from the first, find the closest layered neighbor
//   - if no neighbor, set layer=1
//   - if neighbor, set layer based on the distance, so that locs'
//     markers do not visually overlap
//   - mark loc as layered.
//
// Physical analogy:
// - You kind of drop the locations like eggs on a hard glass.
// - The round splat of an egg is one layer thick.
// - If egg is dropped on the soft splats, their splat becomes smaller.
// - Then you look the result from below of the glass.

var dal = require('./dal');
var async = require('async');

exports.run = function (callback) {

  dal.markAllAsUnlayered(function (err) {
    if (err) {
      return callback(err);
    }

    dal.findAll(function (err2, locs) {
      if (err2) {
        return callback(err2);
      }

      async.eachSeries(locs, function iteratee(loc, cb) {
        // This step marks each location as layered.
        dal.findLayerAndStore(loc, cb);
      }, function (err3) {
        if (err3) {
          return callback(err3);
        }

        var msg = 'layers: Layers of locations (' + locs.length + ') ' +
        'computed and stored.';
        console.log(msg);

        return callback();
      });

    });
  });

};
