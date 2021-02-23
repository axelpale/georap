/* eslint-disable no-var */
var bus = require('./lib/bus')

exports.bus = bus(function (loc, ev) {
  return ev.locationId === loc._id
})
