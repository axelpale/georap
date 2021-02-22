var rootBus = require('tresdb-bus');
var models = require('tresdb-models');

exports.bus = models.bus(rootBus, function (loc, ev) {
  return ev.locationId === loc._id;
});
