var pointMap = {
  'location_created': 10,
  'location_removed': -10,
  'location_entry_created_file': 5,
  'location_entry_removed_file': -5,
  'location_entry_created_visit': 20,
  'location_entry_removed_visit': -20,
  'location_unproved_visit_created': 2,
  'location_name_changed': 0,
  'location_geom_changed': 1,
  'location_tags_changed': 2,
};

module.exports = function (ev) {
  // Return number of scene points from the event.

  if (ev.type.startsWith('location_entry_')) {
    if (ev.data.isVisit) {
      return pointMap[ev.type + '_visit'];
    }
    if (ev.data.filename !== null) {
      return pointMap[ev.type + '_file'];
    }
  }

  if (pointMap.hasOwnProperty(ev.type)) {
    return pointMap[ev.type];
  }
  return 0;
};
