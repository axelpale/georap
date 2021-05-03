module.exports = function (en) {
  // Types of v5 entries:
  //
  // - attachment
  // - story
  // - visit
  //
  // - created
  // - move
  // - rename
  // - tagadd
  // - tagdel
  //
  // For v6 events, see
  // - server/api/events/dal.js

  const t = en.type;

  if (t === 'attachment') {
    return {
      type: 'location_entry_created',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        entryId: en._id,
        markdown: null,
        isVisit: false,
        filepath: en.data.filepath,
        mimetype: en.data.mimetype,
        thumbfilepath: en.data.thumbfilepath,
        thumbmimetype: en.data.thumbmimetype,
      },
    };
  }

  if (t === 'story') {
    return {
      type: 'location_entry_created',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        entryId: en._id,
        markdown: en.data.markdown,
        isVisit: false,
        filepath: null,
        mimetype: null,
        thumbfilepath: null,
        thumbmimetype: null,
      },
    };
  }

  // Temporary handling of unproved visits
  if (t === 'visit') {
    return {
      type: 'location_unproved_visit_created',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        entryId: en._id,
        year: en.data.year,
      },
    };
  }

  if (t === 'created') {
    return {
      type: 'location_created',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        lat: en.data.lat,
        lng: en.data.lng,
      },
    };
  }

  if (t === 'move') {
    return {
      type: 'location_geom_changed',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        newGeom: en.data.newGeom,
        oldGeom: en.data.oldGeom,
      },
    };
  }

  if (t === 'rename') {
    return {
      type: 'location_name_changed',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        oldName: en.data.oldName,
        newName: en.data.newName,
      },
    };
  }

  if (t === 'tagadd') {
    return {
      type: 'location_tags_changed',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        newTags: [en.data.tag],
        oldTags: [],  // incorrect value but correct difference
      },
    };
  }

  if (t === 'tagdel') {
    return {
      type: 'location_tags_changed',
      user: en.user,
      time: en.time,
      locationId: en.locationId,
      locationName: en.locationName,
      data: {
        newTags: [],  // incorrect value but correct difference
        oldTags: [en.data.tag],
      },
    };
  }

  throw new Error('Unknown v5 entry type: ' + t);
};
