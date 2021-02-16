module.exports = (chev, filepathToAttachments) => {
  // Params:
  //   chev: raw v11 location_entry_changed
  //   filepathToAttachments: mapping from filename to attachment key array
  //
  // Return
  //   raw v12 location_entry_changed
  //
  // v11 event:
  //   _id: db.id('581f166110a1482dd038f33a'),
  //   type: "location_entry_changed",
  //   user: "admin",
  //   time: "2017-06-29T18:44:21.194Z",
  //   locationId: c.irbeneId,
  //   locationName: "Irbene",
  //   data: {
  //     entryId: c.locatorEntryId,
  //     oldMarkdown: null,
  //     newMarkdown: 'Ventspils RT-32 radio telescope',
  //     oldIsVisit: false,
  //     newIsVisit: true,
  //     oldFilepath: '2009/RxRvKSlbl/radar.jpg',
  //     newFilepath: 'image/jpeg',
  //     oldMimetype: '2009/RxRvKSlbl/radar_medium.jpg',
  //     newMimetype: 'image/jpeg',
  //     oldThumbfilepath: '2009/RxRvKSlbl/radar.jpg',
  //     newThumbfilepath: 'image/jpeg',
  //     oldThumbmimetype: '2009/RxRvKSlbl/radar_medium.jpg',
  //     newThumbmimetype: 'image/jpeg',
  //   },
  //
  // v12 event
  //   _id: db.id('581f166110a1482dd038f33a'),
  //   type: "location_entry_changed",
  //   user: "admin",
  //   time: "2017-06-29T18:44:21.194Z",
  //   locationId: c.irbeneId,
  //   locationName: "Irbene",
  //   data: {
  //     entryId: c.locatorEntryId,
  //     original: { // NOTE original values of the changed
  //       markdown: null,
  //       flags: [],
  //     },
  //     delta: { // NOTE new values of the changed
  //       markdown: 'Ventspils RT-32 radio telescope',
  //       flags: ['visit'],
  //     },
  //   },
  //
  const original = {};
  const delta = {};

  if (chev.data.oldMarkdown !== chev.data.newMarkdown) {
    let oldmd = chev.data.oldMarkdown;
    let newmd = chev.data.newMarkdown;
    if (oldmd === null) {
      oldmd = '';
    }
    if (newmd === null) {
      newmd = '';
    }
    original.markdown = oldmd;
    delta.markdown = newmd;
  }

  if (chev.data.oldIsVisit !== chev.data.newIsVisit) {
    original.flags = chev.data.oldIsVisit ? ['visit'] : [];
    delta.flags = chev.data.newIsVisit ? ['visit'] : [];
  }

  if (chev.data.oldFilepath !== chev.data.newFilepath) {
    original.attachments = chev.data.oldFilepath
      ? filepathToAttachments[chev.data.oldFilepath] : [];
    delta.attachments = chev.data.newFilepath
      ? filepathToAttachments[chev.data.newFilepath] : [];
  }

  return {
    _id: chev._id,
    locationId: chev.locationId,
    locationName: chev.locationName,
    time: chev.time,
    type: 'location_entry_changed',
    user: chev.user,
    data: {
      entryId: chev.data.entryId,
      original: original,
      delta: delta,
    },
  };
};
