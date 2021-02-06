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
