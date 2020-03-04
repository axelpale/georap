// Max hiding time frame. E.g. if two similar entries are created within
// this duration, the first might be hidden.
var MAX_DIFF_MSEC = 300000 // 5 * 60 * 1000

exports.mergeLocationCreateRename = function (evs) {
  //
  // Params:
  //   evs, most recent first
  //
  // Return a transformed list of events for viewing.
  //
  var newEvs = []
  var i, ev, modEv, nextEv
  for (i = 0; i < evs.length; i += 1) {
    ev = evs[i]

    if (evs.length === i + 1) {
      // At last event.
      newEvs.push(ev)
      break
    }

    modEv = ev
    nextEv = evs[i + 1]

    if (ev.locationId.toString() === nextEv.locationId.toString()) {
      if (ev.type === 'location_name_changed') {
        if (nextEv.type === 'location_created') {
          // Merge to single location_created
          modEv = Object.assign({}, nextEv, {
            locationName: ev.data.newName
          })
          // Skip the original location_created event.
          i += 1
        }
      }
    }

    newEvs.push(modEv)
  }

  return newEvs
}

exports.mergeEntryCreateEdit = function (evs) {
  // Merges location_entry_created and location_entry_changed events
  // when they are adjacent and reasonably close in time.
  //
  // Params:
  //   evs, most recent first
  //
  // Return a transformed list of events for viewing.
  //
  var newEvs = []
  var i, ev, skip, nextEv
  for (i = 0; i < evs.length; i += 1) {
    ev = evs[i]

    if (evs.length === i + 1) {
      // At last event; we cannot look forward.
      newEvs.push(ev)
      break
    }

    skip = false
    nextEv = evs[i + 1]

    if (ev.locationId.toString() === nextEv.locationId.toString() &&
        ev.user === nextEv.user &&
        ev.type === 'location_entry_changed') {
      if (nextEv.type === 'location_entry_changed' ||
          nextEv.type === 'location_entry_created') {
        // Compare ISO 8601 time.
        if (Date.parse(ev.time) - Date.parse(nextEv.time) < MAX_DIFF_MSEC) {
          // Skip the edit event.
          skip = true
        }
      }
    }

    if (!skip) {
      newEvs.push(ev)
    }
  } // endfor

  return newEvs
}

exports.dropEntryCommentDeleteGroups = function (evs) {
  // Comment delete hides n edits and the create event.
  var commentRemovedEvs = evs.filter(function (ev) {
    return ev.type === 'location_entry_comment_removed'
  })
  var commentIdsToAvoid = commentRemovedEvs.map(function (ev) {
    return ev.data.commentId
  })

  var clearedEvs = evs.filter(function (ev) {
    if (ev.type.startsWith('location_entry_comment_')) {
      // Event is bad if it carries a commentId that has been removed.
      var isBad = commentIdsToAvoid.some(function (badId) {
        return badId === ev.data.commentId
      })
      if (isBad) {
        return false
      }
      return true
    }
    return true
  })

  return clearedEvs
}

exports.dropEntryCommentChanged = function (evs) {
  return evs.filter(function (ev) {
    return ev.type !== 'location_entry_comment_changed'
  })
}

exports.mergeTagged = function (evs) {
  // Params:
  //   evs: most recent first
  //
  // If next (newer) event is a tagging event from same user and same location
  // then hide the current premature tag event.
  //
  var tagType = 'location_tags_changed'
  return evs.filter(function (ev, i) {
    var nextEv = evs[i - 1]
    if (nextEv) {
      // Current ev has an adjacent event that is newer
      if (nextEv.user === ev.user) {
        // Both current and next are from same user.
        if (nextEv.type === tagType && ev.type === tagType) {
          // Both current and next are tagging events.
          if (nextEv.locationId.toString() === ev.locationId.toString()) {
            // Both are from same location.
            return false
          }
        }
      }
    }
    return true
  })
}
