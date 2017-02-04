var dal = require('./dal');
var status = require('http-status-codes');

exports.getWithin = function (req, res) {
  // Parameters:
  //   req.param.
  //     lat
  //       number
  //     lng
  //       number
  //     radius
  //       max distance from the center in meters
  //     layer
  //       equals to zoom level. Get only locations on this and higher layers.
  //   res
  //     response object
  //
  // Response on success:
  //   array of Markers
  //
  // Each Marker has following properties
  //   _id
  //     string
  //   name
  //     string
  //   geom
  //     GeoJSON point
  //   tags
  //     array of strings
  //   layer
  //     integer
  var lat, lng, radius, layer;

  // Validate the request to prevent injection
  var validRequest = (req.query.hasOwnProperty('lat') &&
                      req.query.hasOwnProperty('lng') &&
                      req.query.hasOwnProperty('radius') &&
                      req.query.hasOwnProperty('layer'));

  if (validRequest) {
    try {
      lat = parseFloat(req.query.lat);
      lng = parseFloat(req.query.lng);
      radius = parseFloat(req.query.radius);
      layer = parseInt(req.query.layer, 10);
    } catch (err) {
      validRequest = false;
    }
  }

  if (!validRequest) {
    return res.sendStatus(status.BAD_REQUEST);
  }  // else

  dal.getWithin({
    lat: lat,
    lng: lng,
    radius: radius,
    layer: layer,
  }, function (err, markers) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(markers);
  });
};
