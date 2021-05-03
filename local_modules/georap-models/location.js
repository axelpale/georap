/* eslint-disable no-var */
var bus = require('./lib/bus')
var forward = require('./lib/forward')
var attachmentsModel = require('./attachments')

exports.forward = forward({
  location_entry_created: function (location, ev) {
    // If no thumbnail yet, the first image becomes the thumbnail.
    if (!location.thumbnail) {
      var imgs = attachmentsModel.getImages(ev.data.entry.attachments)
      if (imgs.length > 0) {
        location.thumbnail = imgs[0]
      }
    }
  },

  location_entry_changed: function (location, ev) {
    // If the attachment selected as the thumbnail was removed
    // we should change the location thumbnail.
    // However, as we are not aware of other entries of the location
    // we cannot know how the thumbnail has changed or nullied.
    // Therefore it is best for now to leave the thumbnail intact client-side.
    // TODO maybe location_thumbnail_changed should be emitted by server?

    // Check if the thumbnail was gained.
    if (!location.thumbnail) {
      // No thumbnail set yet.
      if (ev.data.delta.attachments) {
        var imgs = attachmentsModel.getImages(ev.data.delta.attachments)
        if (imgs.length > 0) {
          location.thumbnail = imgs[0]
        }
      }
    }
  },

  location_entry_removed: function (location, ev) {
    // No-op. We cannot know if entry removal has changed the thumbnail.
    // TODO allow default thumbnail in UI so that it is possible
    // for users to reselect a thumbnail.
  },

  location_thumbnail_changed: function (location, ev) {
    Object.assign(location, ev.data.delta)
  }
})

exports.bus = bus(function (loc, ev) {
  return ev.locationId === loc._id
})

exports.toMarkerLocation = function (loc) {
  return {
    _id: loc._id,
    name: loc.name,
    geom: loc.geom,
    status: loc.status,
    type: loc.type,
    layer: loc.layer,
    childLayer: loc.layer
  }
}
