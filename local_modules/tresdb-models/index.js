/* eslint-disable no-var */

exports.attachment = require('./attachment')
exports.comment = require('./comment')
exports.comments = require('./comments')
exports.entries = require('./entries')
exports.entry = require('./entry')
exports.exports = require('./exports')
exports.geometry = require('./geometry')
exports.location = require('./location')

exports.rawLocationToMarkerLocation = function (rawLoc) {
  return {
    _id: rawLoc._id,
    name: rawLoc.name,
    geom: rawLoc.geom,
    status: rawLoc.status,
    type: rawLoc.type,
    layer: rawLoc.layer,
    childLayer: rawLoc.layer
  }
}
