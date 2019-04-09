exports.mergeCreateRename = function (evs) {
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
