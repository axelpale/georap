// Compute visibility layer for each location.
//
// The algorithm works like this:
// - mark each location as unlayered
// - order locations by points, locs with highest points first
// - starting from the first location, find the closest layered neighbor
//   - if no neighbor, set layer=1
//   - if a neighbor, set the layer of the location based on the distance,
//     so that locs' markers do not visually overlap.
//   - mark the neighbors parenthood level by increasing childLayer.
//   - mark loc as layered.
//
// Physical analogy:
// - You kind of drop the locations like eggs on a hard glass.
// - The round splat of an egg is one layer thick.
// - If egg is dropped on the soft splats, their splat becomes smaller.
// - Then you look the result from below of the glass.

const dal = require('./dal');
const asyn = require('async');

exports.run = function (callback) {

  dal.markAllAsUnlayered((err) => {
    if (err) {
      return callback(err);
    }

    dal.findAll((err2, locs) => {
      if (err2) {
        return callback(err2);
      }

      asyn.eachSeries(locs, (loc, cb) => {
        // This step marks each location as layered.
        dal.findLayerAndStore(loc, cb);
      }, (err3) => {
        if (err3) {
          return callback(err3);
        }

        const msg = 'layers: Layers of locations (' + locs.length + ') ' +
                    'computed and stored.';
        console.log(msg);

        return callback();
      });

    });
  });

};
