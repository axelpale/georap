/* eslint-disable no-var */
var bus = require('./lib/bus')
var forward = require('./lib/forward')
var entriesModel = require('./entries')
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

    // Add entry
    entriesModel.forward(location.entries, ev)
  },

  location_entry_changed: function (location, ev) {
    // If the changed entry loses the selected thumbnail
    // then remove the thumbnail.
    var imgs

    entriesModel.forward(location.entries, ev)

    // Check if the thumbnail was lost.
    if (location.thumbnail) {
      imgs = entriesModel.getImages(location.entries)
      var thumbnailExists = imgs.find(function (att) {
        return att.key === location.thumbnail.key
      })
      if (!thumbnailExists) {
        // Thumbnail went missing. Reset thumbnail.
        if (imgs.length > 0) {
          location.thumbnail = imgs[0]
        } else {
          location.thumbnail = null
        }
      }
    } else {
      // No thumbnail set yet.
      // Check if a thumbnail was gained.
      imgs = entriesModel.getImages(location.entries)
      if (imgs.length > 0) {
        location.thumbnail = imgs[0]
      }
    }
  },

  location_entry_removed: function (location, ev) {
    // If the removed entry containes the last image attachment,
    // then remove the thumbnail.

    // Remove entry
    entriesModel.forward(location.entries, ev)

    // Reset thumbnail if needed
    if (location.thumbnail) {
      var removedThumbnail = ev.data.entry.attachments.find(function (att) {
        return att.key === location.thumbnail.key
      })
      if (removedThumbnail) {
        // Select new thumbnail if images available
        var candidates = entriesModel.getImages(location.entries)
        if (candidates.length > 0) {
          location.thumbnail = candidates[0]
        } else {
          // No thumbnails available anymore
          location.thumbnail = null
        }
      }
    }
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
