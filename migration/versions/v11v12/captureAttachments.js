
module.exports = (entryCreatedEv, entryChangedEvs) => {
  // Parameters:
  //   entryCreatedEv
  //     a v11 location_entry_created event
  //   entryChangedEvs
  //     array of v11 location_entry_changed events
  //

  const entryAttachments = [];
  const crev = entryCreatedEv;
  const chevs = entryChangedEvs;

  if (crev.data.filepath) {
    entryAttachments.push({
      username: crev.user,
      time: crev.time,
      filepath: crev.data.filepath,
      mimetype: crev.data.mimetype,
      thumbfilepath: crev.data.thumbfilepath,
      thumbmimetype: crev.data.thumbmimetype,
    });
  }

  chevs.forEach((chev) => {
    if (chev.data.newFilepath) {
      if (chev.data.newFilepath !== chev.data.oldFilepath) {
        entryAttachments.push({
          username: chev.user,
          time: chev.time,
          filepath: chev.data.newFilepath,
          mimetype: chev.data.newMimetype,
          thumbfilepath: chev.data.newThumbfilepath,
          thumbmimetype: chev.data.newThumbmimetype,
        });
      }
    }
  });

  return entryAttachments;
};
