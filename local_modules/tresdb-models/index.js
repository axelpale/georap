/* eslint-disable no-var */

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

exports.drop = function (arr, test) {
  // Find index
  var i, index
  index = -1
  for (i = 0; i < arr.length; i += 1) {
    if (test(arr[i])) {
      index = i
      break
    }
  }

  // Already removed if not found, thus return
  if (index === -1) {
    return
  }

  // Remove in place
  arr.splice(index, 1)
}

exports.forward = function (forwarders) {
  return function (obj, ev) {
    if (ev.type in forwarders) {
      forwarders[ev.type](obj, ev)
    }
  }
}

exports.forwardOne = function (model, test) {
  return function (arr, ev) {
    const obj = arr.find(function (o) {
      return test(o, ev)
    })
    if (obj) {
      model.forward(obj, ev)
    }
  }
}

exports.bus = function (sourceBus, test) {
  // A super-factory that creates a model-specific bus factory.
  // Takes a test function that specifies which events are handled.
  //
  // Parameters:
  //   sourceBus
  //     a minibus bus that will be listened for events.
  //   test
  //     function (obj, ev) => bool. If true, event handler will be called.
  //
  // Return
  //   function. A general factory that creates a model-specific bus factory.
  //
  // Model-specific bus factory
  //   function (obj) => object-specific bus instance
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
  //   var bus = busFactory(location)
  //   bus.on('location_entry_created', (ev) => { ... })
  //   bus.off()
  //
  return function (obj) {
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
