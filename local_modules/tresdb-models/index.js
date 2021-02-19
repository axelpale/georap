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
