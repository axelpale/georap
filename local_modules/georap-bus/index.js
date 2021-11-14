/* eslint-disable no-var */
var minibus = require('minibus')

minibus.extension.sub = function () {
  // Return a local bus object that remembers the bound handlers
  // and thus provides an easy way to off them.
  //
  var self = this
  var routes = []
  return {

    on: function (evName, handler) {
      var route = self.on(evName, handler)
      routes.push(route)
    },

    off: function () {
      self.off(routes)
      routes = [] // for garbage collector
    }

  }
}

var rootBus = minibus.create()

module.exports = rootBus
