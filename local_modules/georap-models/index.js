/* eslint-disable no-var */

exports.attachment = require('./attachment')
exports.attachments = require('./attachments')
exports.comment = require('./comment')
exports.comments = require('./comments')
exports.entries = require('./entries')
exports.entry = require('./entry')
exports.exports = require('./exports')
exports.geometry = require('./geometry')
exports.location = require('./location')

exports.bus = function (sourceBus) {
  // Return a local bus object that remembers the bound handlers
  // and thus provides an easy way to off them.
  //
  var routes = []
  return {

    on: function (evName, handler) {
      var route = sourceBus.on(evName, handler)
      routes.push(route)
    },

    off: function () {
      routes.forEach(function (route) {
        sourceBus.off(route)
      })
      routes = [] // for garbage collector
    }

  }
}
