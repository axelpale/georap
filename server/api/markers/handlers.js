var dal = require('./dal');
var status = require('http-status-codes');
var _ = require('lodash');

exports.getFiltered = function (req, res) {
  // Parameters:
  //   req.query
  //     visited
  //       string, possibilities: 'off', 'you', 'notyou', 'nobody'
  //       If omitted, defaults to 'off'
  //     tags
  //       array, tags to allow. Include locations with any of these tags.
  //       If omitted, will include locations regardless of tags.
  //       Special tag: '- no tags -', will match only locations without tags.
  //     text
  //       search term, leave out or use '' to disable.
  //
  // Response on success:
  //   JSON array of markers

  var visited = req.query.visited;
  var tags = req.query.tags;
  var text = req.query.text;

  if (!_.includes(['off', 'you', 'notyou', 'nobody'], visited)) {
    visited = 'off';
  }

  if (_.isArray(tags)) {
    if (!_.every(tags, _.isString)) {
      return res.sendStatus(status.BAD_REQUEST);
    }
    // else valid
  } else {
    tags = [];
  }


  if (typeof text !== 'string') {
    text = '';
  }

  dal.getFiltered({
    username: req.user.name,
    visited: visited,
    tags: tags,
    text: text,
  }, function (err, markers) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(markers);
  });
};

exports.getWithin = function (req, res) {
  // Parameters:
  //   req.query.
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
    query: {},
  }, function (err, markers) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(markers);
  });
};
