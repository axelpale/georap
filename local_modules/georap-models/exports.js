/* eslint-disable no-var */
// Indices for values in config arrays
var NAME = 0
var COORD_SYS = 2
var BOUNDS = 3

exports.getSimplified = function (exportServices, urlTemplates) {
  // Exports services can be referenced by a link.
  // Collect the templates here for simpler code.
  // Some services require non-WGS84 coordinates.
  // Location provides those via getAltGeom method.
  //
  // Parameters:
  //   exportServices
  //     array of arrays. See config for details.
  //   urlTemplates
  //     object of template functions: serviceName -> template fn
  //
  return exportServices.map(function (serv) {
    var servName = serv[NAME]
    var servCoordSys = serv[COORD_SYS]
    var servLatLngBounds = serv[BOUNDS]

    return {
      name: servName,
      system: servCoordSys,
      template: urlTemplates[servName],
      bounds: servLatLngBounds
    }
  })
}

exports.getAvailableServices = function (simplifiedExportServices, geoms) {
  // Select services available for this location
  //
  // Parameters:
  //   simplifiedExportServices
  //     array of simplified export service objects. See getSimplified.
  //   geoms
  //     object: coordinateSystemName -> [lng, lat]
  //
  // Return
  //   array of simplified export service objects
  //

  // NOTE In future, the bounds could be given in any coordinate system.
  // NOTE For now, the bounds are in WGS84.
  var lat = geoms.WGS84[1]
  var lng = geoms.WGS84[0]

  return simplifiedExportServices.filter(function (es) {
    // Select service if current location in any of its bounds.
    if (es.bounds) {
      var i, bounds
      for (i = 0; i < es.bounds.length; i += 1) {
        bounds = es.bounds[i]
        if (lng <= bounds.east && bounds.west <= lng) {
          if (lat <= bounds.north && bounds.south <= lat) {
            // Is inside
            return true
          }
        }
      }
      return false
    }
    // Bounds not defined. Always available.
    return true
  })
}

exports.getServiceUrls = function (simplifiedServices, geoms, zoom, locName) {
  // Compute service templates into URLs
  //
  // Parameters:
  //   simplifiedExportServices
  //     array of simplified export service objects. See getSimplified.
  //   geoms
  //     object: coordinateSystemName -> [lng, lat]
  //
  // Return
  //   array of { name, url }
  //
  return simplifiedServices.map(function (es) {
    var altCoords = geoms[es.system]

    var url = es.template({
      name: locName,
      zoom: zoom,
      longitude: altCoords[0],
      latitude: altCoords[1]
    })

    return {
      name: es.name,
      url: url
    }
  })
}

exports.getServiceButtons = function (serviceUrls) {
  // Parameters:
  //   serviceUrls
  //     array of { name, url } objects
  //
  // Return
  //   string, buttons as html
  //
  return serviceUrls.reduce(function (acc, nameUrl) {
    var serviceUrl = nameUrl.url
    var serviceName = nameUrl.name
    return acc + '<a href="' + serviceUrl + '" ' +
      'class="btn btn-default" role="button" target="_blank">' +
      serviceName +
      '</a> '
  }, '')
}
