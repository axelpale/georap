// Max hiding time frame. E.g. if two similar entries are created within
// this duration, the first might be hidden.
var MAX_DIFF_MSEC = 300000; // 5 * 60 * 1000

exports.mergeLocationCreateRename = function (evs) {
  //
  // Params:
  //   evs, most recent first
  //
  // Return a transformed list of events for viewing.
  //
  var newEvs = [];
  var i, ev, modEv, nextEv;
  for (i = 0; i < evs.length; i += 1) {
    ev = evs[i];

    if (evs.length === i + 1) {
      // At last event.
      newEvs.push(ev);
      break;
    }

    modEv = ev;
    nextEv = evs[i + 1];

    if (ev.locationId === nextEv.locationId) {
      if (ev.type === 'location_name_changed') {
        if (nextEv.type === 'location_created') {
          // Merge to single location_created
          modEv = Object.assign({}, nextEv, {
            locationName: ev.data.newName,
          });
          // Skip the original location_created event.
          i += 1;
        }
      }
    }

    newEvs.push(modEv);
  }

  return newEvs;
};

exports.mergeEntryCreateEdit = function (evs) {
  // Merges location_entry_created and location_entry_changed events
  // when they are adjacent and reasonably close in time.
  //
  // Params:
  //   evs, most recent first
  //
  // Return a transformed list of events for viewing.
  //
  var newEvs = [];
  var i, ev, skip, nextEv;
  for (i = 0; i < evs.length; i += 1) {
    ev = evs[i];

    if (evs.length === i + 1) {
      // At last event; we cannot look forward.
      newEvs.push(ev);
      break;
    }

    skip = false;
    nextEv = evs[i + 1];

    if (ev.locationId === nextEv.locationId && ev.user === nextEv.user &&
        ev.type === 'location_entry_changed') {
      if (nextEv.type === 'location_entry_changed' ||
          nextEv.type === 'location_entry_created') {
        // Compare ISO 8601 time.
        if (Date.parse(ev.time) - Date.parse(nextEv.time) < MAX_DIFF_MSEC) {
          // Skip the edit event.
          skip = true;
        }
      }
    }

    if (!skip) {
      newEvs.push(ev);
    }
  } // endfor

  return newEvs;
};
