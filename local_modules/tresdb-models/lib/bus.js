/* eslint-disable no-var */

module.exports = function (test) {
  // A super-factory that creates a model-specific bus factory.
  // Takes a test function that specifies which events are handled.
  //
  // Parameters:
  //   test
  //     function (obj, ev) => bool. If true, event handler will be called.
  //
  // Return
  //   function. A general factory that creates a model-specific bus factory.
  //
  // Model-specific bus factory
  //   function (obj, sourceBus) => object-specific bus instance
  //     obj
  //       object to be tested against
  //     sourceBus
  //       a minibus bus that will be listened for events.
  //
  // Object-specific bus instance
  //   object { on, off }, where
  //     on: function (eventName, handler)
  //     off: function ()
  //
  // Usage
  //   var busFactory = models.bus((location, ev) => {
  //     return location._id === ev.locationId
  //   })
  //   var bus = busFactory(location, rootBus)
  //   bus.on('location_entry_created', (ev) => { ... })
  //   bus.off()
  //
  return function (obj, sourceBus) {
    // Return a bus object that emits events of the given object.
    //
    var routes = []
    return {

      on: function (evName, handler) {
        var route = sourceBus.on(evName, function (ev) {
          if (test(obj, ev)) {
            return handler(ev)
          }
        })
        routes.push(route)
      },

      off: function () {
        routes.forEach(function (route) {
          sourceBus.off(route)
        })
        routes = null // for garbage collector
      }

    }
  }
}
