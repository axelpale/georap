/* eslint-disable no-var */
var bus = require('./lib/bus')

exports.bus = bus(function (loc, ev) {
  return ev.locationId === loc._id
})

exports.toMarkerLocation = function (loc) {
  return {
    _id: loc._id,
    name: loc.name,
    geom: loc.geom,
    status: loc.status,
    type: loc.type,
    layer: loc.layer,
    childLayer: loc.layer
  }
}
