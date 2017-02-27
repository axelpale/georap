
var pointMap = {
  'location_created': 10,
  'location_removed': -10,
  'location_attachment_created': 5,
  'location_attachment_removed': -5,
  'location_story_created': 1,
  'location_story_changed': 0,
  'location_story_removed': -1,
  'location_visit_created': 10,
  'location_visit_removed': -10,
  'location_name_changed': 0,
  'location_geom_changed': 1,
  'location_tags_changed': 2,
};

var getPoints = function (ev) {
  // Return number of scene points from the event.

  if (pointMap.hasOwnProperty(ev.type)) {
    return pointMap[ev.type];
  }
  return 0;
};

module.exports = function (ev) {
  var p, h;

  p = getPoints(ev);

  h = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>';

  if (p > 0) {
    h += ' <span>+' + p + '</span>';
  } else if (p < 0) {
    h += ' <span>' + p + '</span>';
  } else {
    return ''; // No points
  }

  return h;
};
